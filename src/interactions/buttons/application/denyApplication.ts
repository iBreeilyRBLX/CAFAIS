/* eslint-disable no-inline-comments */
import {
    GuildMember,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} from 'discord.js';
import { Button } from '../../../interfaces';
import prisma from '../../../database/prisma';

const button: Button = {
    name: 'denyApplication',
    execute: async (client: any, interaction: any) => {
        const [action, applicantId] = interaction.customId.split('_');
        if (action !== 'denyApplication') return;

        const author = interaction.member as GuildMember;

        // Check if the user has a pending application
        const application = await prisma.applicationSubmission.findUnique({
            where: { userDiscordId: applicantId },
        });
        if (!application || !application.isPending) {
            return interaction.reply({ content: 'No pending application found for this user.', ephemeral: true });
        }

        const guild = interaction.guild;
        if (!guild) return;

        const member = await guild.members.fetch(applicantId).catch(() => null);
        if (!member) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('# Error'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('Applicant not found.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
            return;
        }

        try {
            // Defer interaction first
            await interaction.deferUpdate();

            const now = new Date();
            const timestamp = now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });

            // Get verified user info for Roblox details
            const verifiedUser = await prisma.verifiedUser.findUnique({ where: { discordId: applicantId } });

            const container = new ContainerBuilder();
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('#  Application denied.'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`👤 **Applicant:** **${member.user.tag}** (${member.user.id}) <@${member.user.id}>`));
            if (verifiedUser) {
                const robloxDisplayName = verifiedUser.robloxDisplayName || verifiedUser.robloxUsername;
                const robloxProfile = `https://www.roblox.com/users/${verifiedUser.robloxId}/profile`;
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`🎮 **Roblox:** ${robloxDisplayName}(@${verifiedUser.robloxUsername}) ([View Profile](${robloxProfile}))`));
            }
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('The application has been denied.'));

            // Show original application details
            const applicationInfo = new TextDisplayBuilder().setContent(
                `**Why are you applying?**\n\`\`\`\n${application.applicationReason}\n\`\`\`\n\n` +
                `**Where did you find us?** ${application.foundServer}\n` +
                `**Are they above 13?** ${application.age}`,
            );
            container.addTextDisplayComponents(applicationInfo);
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`⏰ **Timestamp:** ${timestamp}`));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`❌ **Denied by:** ${author.displayName}`));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
            await interaction.followUp({ content: '❌ Application denied.', ephemeral: true });

            // Remove Applicant role
            // await member.roles.remove('1454532106565845064');

            const dmContainer = new ContainerBuilder();
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('# ❌ Application Denied'));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`⏰ **Denied:** ${timestamp}`));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`<@${applicantId}>, your application has been denied.`));
            if (verifiedUser) {
                const robloxProfile = `https://www.roblox.com/users/${verifiedUser.robloxId}/profile`;
                const robloxDisplayName = verifiedUser.robloxDisplayName || verifiedUser.robloxUsername;
                dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                    `👤 **Discord:** ${member.user.tag}\n` +
                    `🎮 **Roblox:** ${robloxDisplayName}\n` +
                    `🔗 [View Profile](${robloxProfile})`,
                ));
            }
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('📋 **Your Application:**'));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Submission #:** ${application.submissionCount}\n` +
                `**Reason:** \`\`\`\n${application.applicationReason}\n\`\`\``,
            ));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('You may reapply in the future.'));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: false }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`❌ **Denied by:** ${author.displayName}`));

            await member.user.send({ flags: MessageFlags.IsComponentsV2, components: [dmContainer] }).catch(() => null);

            // Delete the application submission record from the database
            await prisma.applicationSubmission.delete({
                where: { id: application.id },
            });
        }
        catch (error) {
            console.error(error);
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('# Denial Failed'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('An error occurred while denying the application.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
        }
    },
};

export default button;
