/**
 * @fileoverview Academy Log Command - Logs academy training and promotes eligible initiates
 * @module commands/events/academy-log
 */

import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    VoiceChannel,
} from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { batchPromoteUsers } from '../../features/rankingManager';
import { logAcademyTraining } from '../../features/discordLogger';
import { Rank, PromotionRequest } from '../../types/ranking';
import { AcademyLogData, ParticipantInfo } from '../../types/events';
import {
    toggleParticipant,
    extractFailedParticipants,
    collectVoiceChannelMembers,
} from '../../utilities';
import { endEvent } from '../../services';
import configJSON from '../../config.json';
import { validateEventName, validateImageUrl, validateText } from '../../utilities/validation';
import { logger } from '../../utilities/logger';

/**
 * Initiate rank role ID (for identifying who can be promoted)
 */
const INITIATE_ROLE_ID = configJSON.roles.initiate;

/**
 * Points awarded for academy training completion
 */
const ACADEMY_PASS_POINTS = 2;

class AcademyLogCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('academy-log')
        .setDescription('Log academy training and promote eligible initiates (Training Department only)')
        .addStringOption(option =>
            option.setName('eventname')
                .setDescription('Name of the academy training event')
                .setRequired(true),
        )
        .addUserOption(option =>
            option.setName('extraparticipant1')
                .setDescription('Add/remove participant (toggles if already in VC)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('extraparticipant2')
                .setDescription('Add/remove participant (toggles if already in VC)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('extraparticipant3')
                .setDescription('Add/remove participant (toggles if already in VC)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('extraparticipant4')
                .setDescription('Add/remove participant (toggles if already in VC)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('extraparticipant5')
                .setDescription('Add/remove participant (toggles if already in VC)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('failedparticipant1')
                .setDescription('Mark participant as failed (will not be promoted)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('failedparticipant2')
                .setDescription('Mark participant as failed (will not be promoted)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('failedparticipant3')
                .setDescription('Mark participant as failed (will not be promoted)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('failedparticipant4')
                .setDescription('Mark participant as failed (will not be promoted)')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('failedparticipant5')
                .setDescription('Mark participant as failed (will not be promoted)')
                .setRequired(false),
        )
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Training notes or observations')
                .setRequired(false),
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Screenshot or image link')
                .setRequired(false),
        ) as SlashCommandBuilder;

    public global = false;

    protected async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember;
        if (!member) {
            await interaction.editReply({ content: 'Unable to verify your permissions.' });
            return;
        }

        // Check Training Department permission
        const { hasTrainingDepartmentRole } = await import('../../utilities');
        if (!hasTrainingDepartmentRole(member)) {
            await interaction.editReply({
                content: '❌ This command can only be used by Training Department members.',
            });
            return;
        }

        // Check if user is in voice channel
        const voice = member.voice;
        if (!voice.channel) {
            await interaction.editReply({
                content: '❌ You must be in a voice channel to log academy training.',
            });
            return;
        }

        const channel = voice.channel as VoiceChannel;
        const eventName = interaction.options.getString('eventname', true);
        const notes = interaction.options.getString('notes') || undefined;
        const imageLink = interaction.options.getString('image') || undefined;

        // Validate inputs
        const nameValidation = validateEventName(eventName);
        if (!nameValidation.valid) {
            await interaction.editReply({ content: `❌ ${nameValidation.error}` });
            return;
        }

        if (notes) {
            const notesValidation = validateText(notes, 500);
            if (!notesValidation.valid) {
                await interaction.editReply({ content: `❌ Notes: ${notesValidation.error}` });
                return;
            }
        }

        if (imageLink) {
            const imageValidation = validateImageUrl(imageLink);
            if (!imageValidation.valid) {
                await interaction.editReply({ content: `❌ Image URL: ${imageValidation.error}` });
                return;
            }
        }

        try {
            // Find the most recent Academy Training event started by this user
            const { findActiveEventByTypeAndHost } = await import('../../services');
            const event = await findActiveEventByTypeAndHost('Academy Training', interaction.user.id);

            if (!event) {
                await interaction.editReply({
                    content: '❌ No active Academy Training event found that you started.\n' +
                             'Make sure you started the event with `/start-event` first.',
                });
                return;
            }

            // Collect base participants from voice channel (all members)
            let participants = collectVoiceChannelMembers(channel).map(m => m.user);

            // Process extra participants (toggle logic)
            for (let i = 1; i <= 5; i++) {
                const extraUser = interaction.options.getUser(`extraparticipant${i}`);
                if (extraUser) {
                    participants = toggleParticipant(participants, extraUser);
                }
            }

            // Collect failed participants from options (IDs only; will filter to Initiates below)
            const failedParticipantIds = extractFailedParticipants(interaction);

            if (participants.length === 0) {
                await interaction.editReply({
                    content: '❌ No Initiate participants found in the voice channel or specified.',
                });
                return;
            }

            // Pre-fetch all Initiate members once (performance optimization)
            const initiateMembers = new Map<string, GuildMember>();
            for (const user of participants) {
                const cachedMember = channel.members.get(user.id);
                const targetMember = cachedMember ?? await interaction.guild?.members.fetch(user.id).catch(() => null);
                if (targetMember?.roles.cache.has(INITIATE_ROLE_ID)) {
                    initiateMembers.set(user.id, targetMember);
                }
            }

            // Determine failed Initiates (ignore fail marks for non-Initiates)
            const failedInitiatesIds = new Set<string>();
            for (const userId of failedParticipantIds) {
                if (initiateMembers.has(userId) && participants.some(p => p.id === userId)) {
                    failedInitiatesIds.add(userId);
                }
            }

            // Determine passed Initiates: in participants, Initiate, and not failed
            const passedInitiates: typeof participants = [];
            for (const user of participants) {
                if (initiateMembers.has(user.id) && !failedInitiatesIds.has(user.id)) {
                    passedInitiates.push(user);
                }
            }

            // Prepare promotion requests for passed participants
            const promotionRequests: PromotionRequest[] = [];
            for (const user of passedInitiates) {
                const targetMember = initiateMembers.get(user.id);
                if (!targetMember) continue;

                promotionRequests.push({
                    targetMember,
                    targetUser: user,
                    toRank: Rank.PVT,
                    fromRank: Rank.INT,
                    executorId: interaction.user.id,
                    executorUsername: interaction.user.username,
                    reason: 'Completed academy training',
                    // Academy promotions bypass cooldown and point requirements
                    bypassCooldown: true,
                    bypassPoints: true,
                });
            }

            // Batch promote passed participants
            const promotionResults = await batchPromoteUsers(client, promotionRequests);
            const successfulPromotions = promotionResults.filter(r => r.success);

            // Award points to passed participants
            const participantInfos: ParticipantInfo[] = [];

            // Build Prisma operations for atomicity
            type TxOp = ReturnType<typeof prisma.userProfile.upsert> | ReturnType<typeof prisma.eventParticipant.upsert>;
            const prismaOps: TxOp[] = [];

            // First, ensure UserProfile exists for ALL participants (required for foreign key)
            for (const user of participants) {
                const points = passedInitiates.some(u => u.id === user.id) ? ACADEMY_PASS_POINTS : 0;
                prismaOps.push(
                    prisma.userProfile.upsert({
                        where: { discordId: user.id },
                        update: {
                            username: user.username,
                            discriminator: user.discriminator || '0',
                            ...(points > 0 ? { points: { increment: points } } : {}),
                        },
                        create: {
                            discordId: user.id,
                            username: user.username,
                            discriminator: user.discriminator || '0',
                            points,
                        },
                    }),
                );
            }

            // Then, create EventParticipant records for all participants
            for (const user of participants) {
                const points = passedInitiates.some(u => u.id === user.id) ? ACADEMY_PASS_POINTS : 0;
                const failed = failedInitiatesIds.has(user.id);
                prismaOps.push(
                    prisma.eventParticipant.upsert({
                        where: { eventId_userDiscordId: { eventId: event.id, userDiscordId: user.id } },
                        update: { points, failed },
                        create: { eventId: event.id, userDiscordId: user.id, points, failed },
                    }),
                );

                participantInfos.push({
                    user,
                    discordId: user.id,
                    username: user.username,
                    promoted: successfulPromotions.some(r => r.userId === user.id),
                    failed: failedInitiatesIds.has(user.id),
                    points,
                });
            }

            // Execute DB ops in a transaction
            if (prismaOps.length > 0) {
                await prisma.$transaction(prismaOps);
            }

            // Update event as completed
            const now = new Date();
            const durationMs = now.getTime() - new Date(event.startTime).getTime();

            await endEvent(event.id, ACADEMY_PASS_POINTS, notes, imageLink);

            // Log to Discord
            const logData: AcademyLogData = {
                eventName,
                eventType: 'Academy Training',
                hostId: interaction.user.id,
                hostUsername: interaction.user.username,
                startTime: new Date(event.startTime),
                endTime: now,
                durationMs,
                participants: participantInfos,
                pointsAwarded: ACADEMY_PASS_POINTS,
                notes,
                imageLink,
                promotedCount: successfulPromotions.length,
                failedCount: failedInitiatesIds.size,
            };

            await logAcademyTraining(client, logData);

            // Send success message
            await interaction.editReply({
                content: `✅ **Academy Training Logged: ${eventName}**\n\n` +
                         `**Promoted to Private:** ${successfulPromotions.length} (2 points each)\n` +
                         `**Failed (Initiates only):** ${failedInitiatesIds.size} (0 points)\n` +
                         `**Total Participants:** ${participants.length}\n\n` +
                         `Event logged to <#${configJSON.channels.eventLogs}>`,
            });
        }
        catch (error) {
            logger.error('academy-log', 'Failed to log academy training', error);
            await interaction.editReply({
                content: '❌ Failed to log academy training. Please try again or contact an administrator.',
            });
        }
    }
}

export default new AcademyLogCommand();
