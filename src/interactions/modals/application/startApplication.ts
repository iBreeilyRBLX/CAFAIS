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
} from 'discord.js';
import { ModalSubmit } from '../../../interfaces';
import prisma from '../../../database/prisma';

const modalHandler: ModalSubmit = {
    name: 'startApplication',
    execute: async (client, interaction: ModalSubmitInteraction) => {
        const applicationReason = interaction.fields.getTextInputValue('applicationReason');
        const foundserver = interaction.fields.getTextInputValue('foundserver');
        const age = interaction.fields.getTextInputValue('age');

        // Fetch user's Roblox profile from database using Prisma
        let robloxProfile = 'Not verified';
        let robloxDisplayName = 'Unknown';
        try {
            const verifiedUser = await prisma.verifiedUser.findUnique({
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

        const channelId = '1308670516047118346';
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

        // Use ContainerBuilder for the application message
        const container = new ContainerBuilder();

        const title = new TextDisplayBuilder().setContent('# New Application Submission');
        container.addTextDisplayComponents(title);

        const separator1 = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true });
        container.addSeparatorComponents(separator1);

        const description = new TextDisplayBuilder().setContent(
            `A new application has been submitted by <@${interaction.user.id}>.\n\n` +
            `**Applicant:** ${interaction.user.tag} (${interaction.user.id})\n` +
            `**Roblox Account:** ${robloxDisplayName}\n` +
            `**Roblox Profile Link:** [View Profile](${robloxProfile})\n` +
            `**Reason for Applying:** ${applicationReason}\n` +
            `**Where did you find us?:** ${foundserver}\n` +
            `**Are they above 13 or not?:** ${age}\n` +
            `**Estimated Outcome:** ${estimatedOutcome.charAt(0).toUpperCase() + estimatedOutcome.slice(1)}\n`,
        );
        container.addTextDisplayComponents(description);

        const separator2 = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true });
        container.addSeparatorComponents(separator2);

        const approveButton = new DjsButtonBuilder()
            .setCustomId(`approveApplication_${interaction.user.id}`)
            .setLabel('Approve')
            .setStyle(DjsButtonStyle.Success);

        const denyButton = new DjsButtonBuilder()
            .setCustomId(`denyApplication_${interaction.user.id}`)
            .setLabel('Deny')
            .setStyle(DjsButtonStyle.Danger);

        // Use ActionRowBuilder<ButtonBuilder> for correct typing
        const actionRow = new DjsActionRowBuilder<DjsButtonBuilder>().addComponents(approveButton, denyButton);
        container.addActionRowComponents(actionRow);

        try {
            await applicationsChannel.send(container.toJSON());
        }
        catch (error) {
            console.error('[ERROR] Failed to send application message:', error);
        }

        await interaction.reply({
            content: 'Your application has been submitted for review!',
            ephemeral: true,
        });
    },
};

export default modalHandler;
