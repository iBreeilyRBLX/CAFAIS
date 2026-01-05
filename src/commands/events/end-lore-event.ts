/**
 * @fileoverview End Lore Event Command - Concludes lore events and awards points
 * @module commands/events/end-lore-event
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { logEvent } from '../../features/discordLogger';
import { EventLogData, ParticipantInfo } from '../../types/events';
import { loadEventConfig, calculatePoints, toggleParticipant, collectVoiceChannelMembers, formatDuration, hasLoreDepartmentRole } from '../../utilities';
import { findActiveEventByNameAndType, endEvent } from '../../services';

class EndLoreEventCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('end-lore-event')
        .setDescription('End a lore event and award points (Lore Department only)')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Lore event name')
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
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Event notes or observations')
                .setRequired(false),
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Event screenshot or image URL')
                .setRequired(false),
        ) as SlashCommandBuilder;

    public global = false;

    protected async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember;
        if (!member) {
            await interaction.editReply({ content: 'Unable to verify your permissions.' });
            return;
        }

        // Check Lore Department permission
        if (!hasLoreDepartmentRole(member)) {
            await interaction.editReply({
                content: '❌ This command can only be used by Lore Department members.',
            });
            return;
        }

        const name = interaction.options.getString('name', true);
        const notes = interaction.options.getString('notes') || undefined;
        const imageLink = interaction.options.getString('image') || undefined;

        try {
            // Find active lore event
            const event = await findActiveEventByNameAndType(name, 'Lore');

            if (!event) {
                await interaction.editReply({
                    content: `❌ No active Lore event found with name **${name}**.`,
                });
                return;
            }

            // Check if user is in voice channel
            const voice = member.voice;
            if (!voice.channel) {
                await interaction.editReply({
                    content: '❌ You must be in a voice channel to end the event and collect participants.',
                });
                return;
            }

            const channel = voice.channel as VoiceChannel;

            // Collect participants from voice channel
            let participants = collectVoiceChannelMembers(channel).map(m => m.user);

            // Process extra participants (toggle logic)
            for (let i = 1; i <= 5; i++) {
                const extraUser = interaction.options.getUser(`extraparticipant${i}`);
                if (extraUser) {
                    participants = toggleParticipant(participants, extraUser);
                }
            }

            if (participants.length === 0) {
                await interaction.editReply({
                    content: '❌ No participants found. Make sure there are members in the voice channel.',
                });
                return;
            }

            // Load event config and calculate points
            const config = loadEventConfig();
            const eventConfig = config.eventTypes['Lore'];

            if (!eventConfig) {
                await interaction.editReply({
                    content: '❌ Lore event configuration not found.',
                });
                return;
            }

            const now = new Date();
            const durationMs = now.getTime() - new Date(event.startTime).getTime();
            const points = calculatePoints(durationMs, eventConfig.basePerHour, eventConfig.bonusPer30Min);

            // Award points to all participants
            const participantInfos: ParticipantInfo[] = [];

            for (const user of participants) {
                // Create or update user profile
                await prisma.userProfile.upsert({
                    where: { discordId: user.id },
                    update: {
                        username: user.username,
                        discriminator: user.discriminator || '0',
                        points: { increment: points },
                    },
                    create: {
                        discordId: user.id,
                        username: user.username,
                        discriminator: user.discriminator || '0',
                        points,
                    },
                });

                // Create event participant record
                await prisma.eventParticipant.upsert({
                    where: { eventId_userDiscordId: { eventId: event.id, userDiscordId: user.id } },
                    update: { points },
                    create: { eventId: event.id, userDiscordId: user.id, points },
                });

                participantInfos.push({
                    user,
                    discordId: user.id,
                    username: user.username,
                    promoted: false,
                    failed: false,
                    points,
                });
            }

            // Update event as completed
            await endEvent(event.id, points, notes, imageLink);

            // Log event to Discord
            const logData: EventLogData = {
                eventName: name,
                eventType: 'Lore',
                hostId: event.eventHostDiscordId,
                hostUsername: interaction.user.username,
                startTime: new Date(event.startTime),
                endTime: now,
                durationMs,
                participants: participantInfos,
                pointsAwarded: points,
                notes,
                imageLink,
            };

            await logEvent(client, logData);

            // Send success message
            const durationStr = formatDuration(durationMs);

            await interaction.editReply({
                content: `✅ **Lore Event Ended: ${name}**\n\n` +
                         `**Duration:** ${durationStr}\n` +
                         `**Participants:** ${participantInfos.length}\n` +
                         `**Points Awarded:** ${points} per participant\n\n` +
                         `Event logged to <#1454639394605498449>`,
            });
        }
        catch (error) {
            console.error('[end-lore-event] Failed to end lore event:', error);
            await interaction.editReply({
                content: '❌ Failed to end lore event. Please try again or contact an administrator.',
            });
        }
    }
}

export default new EndLoreEventCommand();
