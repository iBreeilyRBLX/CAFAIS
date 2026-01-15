import {
    ModalSubmitInteraction,
    TextChannel,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ButtonBuilder as DjsButtonBuilder,
    ActionRowBuilder as DjsActionRowBuilder,
    ButtonStyle as DjsButtonStyle,
    MessageFlags,
} from 'discord.js';
import { ModalSubmit } from '../../../interfaces';
import prisma from '../../../database/prisma';
import robloxGroupService from '../../../features/robloxGroupService';
import mococoService from '../../../features/mococoService';
import taseService from '../../../features/taseService';


const modalHandler: ModalSubmit = {
    name: 'applicationModal',
    execute: async (client, interaction: ModalSubmitInteraction) => {
        const applicationReason = interaction.fields.getTextInputValue('applicationReason');
        const foundServer = interaction.fields.getTextInputValue('foundserver');
        const age = interaction.fields.getTextInputValue('age');

        // Fetch user's Roblox profile from database using Prisma
        let robloxProfile = 'Not verified';
        let robloxDisplayName = 'Unknown';
        let verifiedUser: Awaited<ReturnType<typeof prisma.verifiedUser.findUnique>> | null = null;
        try {
            verifiedUser = await prisma.verifiedUser.findUnique({
                where: { discordId: interaction.user.id },
            });
            if (verifiedUser) {
                robloxProfile = `https://www.roblox.com/users/${verifiedUser.robloxId}/profile`;
                robloxDisplayName = verifiedUser.robloxDisplayName || verifiedUser.robloxUsername;
            }
        }
        catch (error) {
            console.error('[ERROR] Failed to fetch Roblox profile from database:', error);
        }

        if (!verifiedUser) {
            await interaction.reply({
                content: 'Please verify your Roblox account and submit a join request to our Roblox group before applying: https://www.roblox.com/groups/11590462',
                ephemeral: true,
            });
            return;
        }

        const robloxUserId = Number(verifiedUser.robloxId);
        if (!Number.isFinite(robloxUserId)) {
            await interaction.reply({
                content: 'We could not read your Roblox account. Please try re-verifying before applying.',
                ephemeral: true,
            });
            return;
        }

        // Defer reply immediately to prevent timeout
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let hasPendingJoinRequestOrMember = false;
        try {
            const alreadyMember = await robloxGroupService.userIsMember(robloxUserId);
            hasPendingJoinRequestOrMember = alreadyMember || (await robloxGroupService.userHasPendingJoinRequest(robloxUserId));
        }
        catch (error) {
            console.error('[ERROR] Failed to validate Roblox group join request:', error);
            await interaction.reply({
                content: 'Could not verify your Roblox group join request right now. Please try again shortly.',
                ephemeral: true,
            });
            return;
        }

        if (!hasPendingJoinRequestOrMember) {
            await interaction.reply({
                content: 'You need to submit a join request to our Roblox group before applying: https://www.roblox.com/groups/11590462',
                ephemeral: true,
            });
            return;
        }

        // Check if user already has a pending application
        const existingApplication = await prisma.applicationSubmission.findUnique({
            where: { userDiscordId: interaction.user.id },
        });
        if (existingApplication && existingApplication.isPending) {
            await interaction.reply({
                content: `You already have a pending application. Please wait for it to be reviewed before submitting another one. (Submission attempt #${existingApplication.submissionCount + 1})`,
                ephemeral: true,
            });
            return;
        }

        const channelId = '1454533368854085663';
        if (!channelId) {
            console.error('[ERROR] APPLICATIONS_CHANNEL_ID is not defined.');
            return;
        }

        let applicationsChannel: TextChannel | null = null;
        try {
            const fetchedChannel = await client.channels.fetch(channelId);
            if (fetchedChannel?.isTextBased()) {
                applicationsChannel = fetchedChannel as TextChannel;
            }
            else {
                console.error('[ERROR] Applications channel is not text-based or does not exist.');
                return;
            }
        }
        catch (error) {
            console.error('[ERROR] Failed to fetch applications channel:', error);
            return;
        }

        await interaction.followUp({
            content: 'Your application is being submitted for review...',
            ephemeral: true,
        });

        // Function to estimate the application outcome, e.g., approve, deny, guest (If has guest of visitor in the reason then estimate guest. if for age is anything above 13 then approve else deny. For above 13 define it as any number higher then 13 or them stating anything with Y in it (as a way of saying yes))
        const estimateApplicationOutcome = (reason: string, ageResponse: string): 'approve' | 'deny' | 'guest' => {
            // Check if the reason contains keywords for guest status
            const reasonLower = reason.toLowerCase();
            if (reasonLower.includes('guest') || reasonLower.includes('visitor')) {
                return 'guest';
            }

            // Check age criteria for approve/deny
            const ageResponseLower = ageResponse.toLowerCase();

            // Check if they stated "yes" (containing 'y')
            if (ageResponseLower.includes('y')) {
                return 'approve';
            }

            // Try to parse as a number
            const ageNumber = parseInt(ageResponse);
            if (!isNaN(ageNumber)) {
                return ageNumber > 13 ? 'approve' : 'deny';
            }

            // If we can't determine from the above criteria, default to deny for safety
            return 'deny';
        };


        const estimatedOutcome = estimateApplicationOutcome(applicationReason, age);
        const submissionAttempt = (existingApplication?.submissionCount ?? 0) + 1;

        // Use ContainerBuilder for the application message
        const container = new ContainerBuilder();

        const title = new TextDisplayBuilder().setContent('# 📋 New Application Submission');
        container.addTextDisplayComponents(title);

        const userInfo = new TextDisplayBuilder().setContent(
            `👤 **${interaction.user.tag}** (${interaction.user.id}) <@${interaction.user.id}>\n` +
            `🎮 **Roblox:** ${robloxDisplayName}(@${verifiedUser.robloxUsername})\n` +
            `🔗 [View Roblox Profile](${robloxProfile})`,
        );
        container.addTextDisplayComponents(userInfo);

        const separator1a = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true });
        container.addSeparatorComponents(separator1a);

        const applicationInfo = new TextDisplayBuilder().setContent(
            `\`#${submissionAttempt}\` **Submission Attempt**\n\n` +
            `**Why are you applying?**\n\`\`\`\n${applicationReason}\n\`\`\`\n\n` +
            `**Where did you find us?** ${foundServer}\n` +
            `**Are they above 13?** ${age}`,
        );
        container.addTextDisplayComponents(applicationInfo);

        const separator1b = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true });
        container.addSeparatorComponents(separator1b);

        const outcomeEmoji = estimatedOutcome === 'approve' ? '✅' : estimatedOutcome === 'guest' ? '👥' : '❌';
        const outcome = new TextDisplayBuilder().setContent(
            `${outcomeEmoji} **Estimated Outcome:** ${estimatedOutcome.charAt(0).toUpperCase() + estimatedOutcome.slice(1)}`,
        );
        container.addTextDisplayComponents(outcome);
        const separator1 = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true });
        container.addSeparatorComponents(separator1);

        const approveButton = new DjsButtonBuilder()
            .setCustomId(`approveApplication_${interaction.user.id}`)
            .setLabel('Approve')
            .setStyle(DjsButtonStyle.Success);

        const denyButton = new DjsButtonBuilder()
            .setCustomId(`denyApplication_${interaction.user.id}`)
            .setLabel('Deny')
            .setStyle(DjsButtonStyle.Secondary);

        const kickButton = new DjsButtonBuilder()
            .setCustomId(`kickApplication_${interaction.user.id}`)
            .setLabel('Kick')
            .setStyle(DjsButtonStyle.Danger);

        const banButton = new DjsButtonBuilder()
            .setCustomId(`banApplication_${interaction.user.id}`)
            .setLabel('Ban Permanently')
            .setStyle(DjsButtonStyle.Danger);

        // Use ActionRowBuilder<ButtonBuilder> for correct typing
        const actionRow = new DjsActionRowBuilder<DjsButtonBuilder>().addComponents(approveButton, denyButton, kickButton, banButton);
        container.addActionRowComponents(actionRow);

        try {
            await applicationsChannel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });

            // Track the application submission in the database
            if (existingApplication) {
                // User has reapplied after being rejected, increment the submission count
                await prisma.applicationSubmission.update({
                    where: { userDiscordId: interaction.user.id },
                    data: {
                        submissionCount: existingApplication.submissionCount + 1,
                        isPending: true,
                        applicationReason,
                        foundServer,
                        age,
                    },
                });
            }
            else {
                // First application from this user
                await prisma.applicationSubmission.create({
                    data: {
                        userDiscordId: interaction.user.id,
                        submissionCount: 1,
                        isPending: true,
                        applicationReason,
                        foundServer,
                        age,
                    },
                });
            }
        }
        catch (error) {
            console.error('[ERROR] Failed to send application message:', error);
        }

        await interaction.editReply({
            content: 'Your application has been submitted successfully!',
        });
    },
};

export default modalHandler;
