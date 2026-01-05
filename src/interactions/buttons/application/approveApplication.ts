/* eslint-disable no-inline-comments */
import {
    GuildMember,
    Message,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} from 'discord.js';
import { Button } from '../../../interfaces';
import prisma from '../../../database/prisma';
import robloxGroupService from '../../../features/robloxGroupService';

const button: Button = {
    name: 'approveApplication',
    execute: async (client: any, interaction: any) => {
        const [action, applicantId] = interaction.customId.split('_');
        if (action !== 'approveApplication') return;

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
            const verifiedUser = await prisma.verifiedUser.findUnique({ where: { discordId: applicantId } });
            if (!verifiedUser) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('# Approval Blocked'));
                container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('Applicant is not Roblox-verified. Please ask them to verify and re-apply.'));

                await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
                return;
            }

            const robloxUserId = Number(verifiedUser.robloxId);
            if (!Number.isFinite(robloxUserId)) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('# Approval Blocked'));
                container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('Could not read the applicant Roblox account. Please have them re-verify.'));

                await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
                return;
            }

            const groupJoinResult = await robloxGroupService.acceptPendingJoinRequest(robloxUserId);
            const groupResultText = {
                accepted: 'Join request accepted.',
                'already-member': 'Already in group.',
                'no-request': 'No pending join request found.',
            }[groupJoinResult];

            // Update with approval status and application details
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

            const container = new ContainerBuilder();
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('# 📋 Application Review'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`⏰ **Timestamp:** ${timestamp}`));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            // Show original application details
            const applicationInfo = new TextDisplayBuilder().setContent(
                `**Why are you applying?**\n\`\`\`\n${application.applicationReason}\n\`\`\`\n\n` +
                `**Where did you find us?** ${application.foundServer}\n` +
                `**Are they above 13?** ${application.age}`,
            );
            container.addTextDisplayComponents(applicationInfo);

            // Show approval decision
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('# ✅ Application Approved'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: false }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`👤 **Applicant:** **${member.user.tag}** (${member.user.id}) <@${member.user.id}>`));
            const robloxDisplayName = verifiedUser.robloxDisplayName || verifiedUser.robloxUsername;
            const robloxProfile = `https://www.roblox.com/users/${verifiedUser.robloxId}/profile`;
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`🎮 **Roblox:** ${robloxDisplayName}(@${verifiedUser.robloxUsername}) ([View Profile](${robloxProfile}))`));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`🎮 **Roblox Group:** ${groupResultText}`));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`✍️ **Approved by:** ${author.displayName}`));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
            await interaction.followUp({ content: '✅ Application approved successfully!', ephemeral: true });

            // Update roles
            await member.roles.remove('1454532106565845064'); // Remove Applicant role
            await member.roles.add('1454248763915898971');


            const dmContainer = new ContainerBuilder();
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('# ✅ Application Approved'));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`⏰ **Approved:** ${timestamp}`));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`<@${applicantId}>, Welcome to the team!`));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `👤 **Discord:** ${member.user.tag}\n` +
                `🎮 **Roblox:** ${robloxDisplayName}\n` +
                `🔗 [View Profile](${robloxProfile})`,
            ));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('📋 **Your Application:**'));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Submission #:** ${application.submissionCount}\n` +
                `**Reason:** \`\`\`\n${application.applicationReason}\n\`\`\`\n` +
                `**Found Us:** ${application.foundServer}`,
            ));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('<#1454564611599761639> contains details regarding your training.\n'));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: false }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`✍️ **Approved by:** ${author.displayName}`));

            await member.user.send({ flags: MessageFlags.IsComponentsV2, components: [dmContainer] });

            // Delete the application submission record from the database
            await prisma.applicationSubmission.delete({
                where: { id: application.id },
            });

        }
        catch (error) {
            console.error(error);
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('# Approval Failed'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('An error occurred while approving the application.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
        }
    },
};

export default button;

