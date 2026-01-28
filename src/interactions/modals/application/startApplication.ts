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
import taseService from '../../../features/taseService';
import { CUSTOM_EMOJIS } from '../../../config/emojis';


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
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const robloxUserId = Number(verifiedUser.robloxId);
        if (!Number.isFinite(robloxUserId)) {
            await interaction.reply({
                content: 'We could not read your Roblox account. Please try re-verifying before applying.',
                flags: MessageFlags.Ephemeral,
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
            await interaction.editReply({
                content: 'Could not verify your Roblox group join request right now. Please try again shortly.',
            });
            return;
        }

        if (!hasPendingJoinRequestOrMember) {
            await interaction.editReply({
                content: 'You need to submit a join request to our Roblox group before applying: https://www.roblox.com/groups/11590462',
            });
            return;
        }

        // Check if user already has a pending application
        const existingApplication = await prisma.applicationSubmission.findUnique({
            where: { userDiscordId: interaction.user.id },
        });
        if (existingApplication && existingApplication.isPending) {
            await interaction.editReply({
                content: `You already have a pending application. Please wait for it to be reviewed before submitting another one. (Submission attempt #${existingApplication.submissionCount + 1})`,
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

        // Perform TASE safety check on the user
        const taseCheckResult = await taseService.checkUser(interaction.user.id);

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
        const container = new ContainerBuilder()
            .setAccentColor(0x3498DB);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## 📋 Application Submission'),
        );

        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Applicant:** ${interaction.user.tag} (<@${interaction.user.id}>)\n` +
                `**${CUSTOM_EMOJIS.roblox.default} Roblox:** ${robloxDisplayName} (@${verifiedUser.robloxUsername}) • [Profile](${robloxProfile})\n` +
                `**Submission:** #${submissionAttempt}`,
            ),
        );

        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Application Reason**\n\`\`\`\n${applicationReason}\n\`\`\`\n\n` +
                `**Found us via:** ${foundServer}\n` +
                `**Age verification:** ${age}`,
            ),
        );

        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

        const outcomeEmoji = estimatedOutcome === 'approve' ? '✅' : estimatedOutcome === 'guest' ? '👥' : '❌';
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `${outcomeEmoji} **Estimated Outcome:** ${estimatedOutcome.charAt(0).toUpperCase() + estimatedOutcome.slice(1)}`,
            ),
        );

        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

        // TASE Safety Check
        const taseEmoji = taseCheckResult.safe ? '✅' : '⚠️';
        let taseContent = `${taseEmoji} **TASE Check:** ${taseCheckResult.description}`;

        // Add matched flags if any exist
        if (taseCheckResult.results.length > 0 && !taseCheckResult.safe) {
            const flagsContent = taseCheckResult.results
                .filter((r) => r.matched)
                .map((r) => `${r.emoji} ${r.name}`)
                .join('\n');

            if (flagsContent) {
                taseContent += `\n\n**Matched Flags:**\n${flagsContent}`;
            }
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(taseContent),
        );

        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

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
            .setLabel('Ban 1 Year')
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
