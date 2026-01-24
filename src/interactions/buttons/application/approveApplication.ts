/* eslint-disable no-inline-comments */
import {
    GuildMember,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    ButtonInteraction,
} from 'discord.js';
import { Button } from '../../../interfaces';
import prisma from '../../../database/prisma';
import robloxGroupService from '../../../features/robloxGroupService';
import ExtendedClient from '../../../classes/Client';
import config from '../../../config.json';

const button: Button = {
    name: 'approveApplication',
    execute: async (client: ExtendedClient, interaction: ButtonInteraction): Promise<void> => {
        const [action, applicantId] = interaction.customId.split('_');
        if (action !== 'approveApplication') return;

        const author = interaction.member as GuildMember;

        // Check if the user has a pending application
        const application = await prisma.applicationSubmission.findUnique({
            where: { userDiscordId: applicantId },
        });
        if (!application || !application.isPending) {
            await interaction.reply({ content: 'No pending application found for this user.', ephemeral: true });
            return;
        }

        const guild = interaction.guild;
        if (!guild) return;

        const member = await guild.members.fetch(applicantId).catch(() => null);
        if (!member) {
            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ Error'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** Applicant not found in server.\n**Action:** User may have left the server.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
            return;
        }

        try {
            const verifiedUser = await prisma.verifiedUser.findUnique({ where: { discordId: applicantId } });
            if (!verifiedUser) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE67E22);
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ⚠️ Approval Blocked'));
                container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** Applicant is not Roblox-verified.\n**Action:** Ask them to verify and re-apply.'));

                await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
                return;
            }

            const robloxUserId = Number(verifiedUser.robloxId);
            if (!Number.isFinite(robloxUserId)) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ Approval Blocked'));
                container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** Invalid Roblox account data.\n**Action:** Have them re-verify their account.'));

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
            const timestamp = `<t:${Math.floor(now.getTime() / 1000)}:f>`;

            const container = new ContainerBuilder()
                .setAccentColor(0x57F287);
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ✅ Application Approved'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**👤 Applicant:** ${member.user.tag} (<@${member.user.id}>)`));
            const robloxDisplayName = verifiedUser.robloxDisplayName || verifiedUser.robloxUsername;
            const robloxProfile = `https://www.roblox.com/users/${verifiedUser.robloxId}/profile`;
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**🎮 Roblox:** ${robloxDisplayName} (@${verifiedUser.robloxUsername}) • [Profile](${robloxProfile})`));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**🎮 Group Status:** ${groupResultText}`));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**✍️ Approved by:** ${author.displayName}`));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            // Show original application details
            const applicationInfo = new TextDisplayBuilder().setContent(
                `**Why are you applying?**\n\`\`\`\n${application.applicationReason}\n\`\`\`\n\n` +
                `**Where did you find us?** ${application.foundServer}\n` +
                `**Are they above 13?** ${application.age}`,
            );
            container.addTextDisplayComponents(applicationInfo);
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`⏰ **Timestamp:** ${timestamp}`));
            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
            await interaction.followUp({ content: 'Application approved successfully.', ephemeral: true });

            // Update roles - use centralized config
            await member.roles.remove(config.roles.applicant);
            await member.roles.add(config.roles.initiate);


            const dmContainer = new ContainerBuilder()
                .setAccentColor(0x57F287);
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🎉 Application Approved!'));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Welcome to the team, <@${applicantId}>!**\n\nYour application has been approved and you're now an Initiate.`));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**👤 Discord:** ${member.user.tag}\n` +
                `**🎮 Roblox:** ${robloxDisplayName} • [Profile](${robloxProfile})`,
            ));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('### 📋 Your Application'));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Submission #${application.submissionCount}**\n\n` +
                `**Why join:** \`\`\`\n${application.applicationReason}\n\`\`\`\n` +
                `**Found us:** ${application.foundServer}`,
            ));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`🎯 **Next Steps:** Visit <#${config.channels.training}> for training information.`));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**✍️ Approved by:** ${author.displayName}\n**⏰ Approved:** ${timestamp}`));

            await member.user.send({ flags: MessageFlags.IsComponentsV2, components: [dmContainer] });

            // Delete the application submission record from the database
            await prisma.applicationSubmission.delete({
                where: { id: application.id },
            });

        }
        catch (error) {
            console.error(error);
            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ Approval Failed'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** An error occurred while approving.\n**Action:** Please try again or contact an administrator.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
        }
    },
};

export default button;

