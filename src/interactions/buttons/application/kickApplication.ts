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
    name: 'kickApplication',
    execute: async (client: any, interaction: any) => {
        const [action, applicantId] = interaction.customId.split('_');
        if (action !== 'kickApplication') return;

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
            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ Error'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** Applicant not found in server.\n**Action:** User may have left the server.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
            return;
        }

        try {

            const now = new Date();
            const timestamp = `<t:${Math.floor(now.getTime() / 1000)}:f>`;

            // Get verified user info for Roblox details
            const verifiedUser = await prisma.verifiedUser.findUnique({ where: { discordId: applicantId } });
            const robloxDisplayName = verifiedUser?.robloxDisplayName || verifiedUser?.robloxUsername;
            const robloxProfile = verifiedUser ? `https://www.roblox.com/users/${verifiedUser.robloxId}/profile` : null;

            const container = new ContainerBuilder()
                .setAccentColor(0xE67E22);

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## Application Denied - User Kicked'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            // Applicant information
            const applicantInfo = `**Applicant:** ${member.user.tag} (<@${member.user.id}>)`;
            const robloxInfo = verifiedUser ? `\n**Roblox:** ${robloxDisplayName} (@${verifiedUser.robloxUsername}) • [Profile](${robloxProfile})` : '';
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(applicantInfo + robloxInfo));

            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            // Application details
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Application Reason**\n\`\`\`\n${application.applicationReason}\n\`\`\`\n\n` +
                `**Found us via:** ${application.foundServer}\n` +
                `**Age verification:** ${application.age}`,
            ));

            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                '**Action:** Applicant has been kicked from the server.',
            ));

            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Actioned by:** ${author.displayName}\n` +
                `**Timestamp:** ${timestamp}`,
            ));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });

            const dmContainer = new ContainerBuilder()
                .setAccentColor(0xE67E22);

            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## You Have Been Kicked'));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `<@${applicantId}>, your application was denied.\n\n` +
                'You may reapply after some time once you meet the requirements.',
            ));

            await member.user.send({ flags: MessageFlags.IsComponentsV2, components: [dmContainer] }).catch(() => null);
            await member.kick('Application denied during review');

            // Update application with cooldown timestamp
            await prisma.applicationSubmission.update({
                where: { id: application.id },
                data: {
                    isPending: false,
                    lastDeniedAt: new Date(),
                },
            });
        }
        catch (error) {
            console.error(error);
            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ Kick Failed'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** An error occurred while kicking the applicant.\n**Action:** Please try again or contact an administrator.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
        }
    },
};

export default button;
