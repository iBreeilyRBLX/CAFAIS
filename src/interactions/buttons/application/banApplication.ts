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
    name: 'banApplication',
    execute: async (client: any, interaction: any) => {
        const [action, applicantId] = interaction.customId.split('_');
        if (action !== 'banApplication') return;

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
            const oneYearMs = 1000 * 60 * 60 * 24 * 365;
            const banExpiresAt = new Date(now.getTime() + oneYearMs);
            const banExpiresTimestamp = `<t:${Math.floor(banExpiresAt.getTime() / 1000)}:D>`;

            // Get verified user info for Roblox details
            const verifiedUser = await prisma.verifiedUser.findUnique({ where: { discordId: applicantId } });
            const robloxDisplayName = verifiedUser?.robloxDisplayName || verifiedUser?.robloxUsername;
            const robloxProfile = verifiedUser ? `https://www.roblox.com/users/${verifiedUser.robloxId}/profile` : null;

            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## Application Denied - User Banned (1 Year)'));
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
                `**Action:** Applicant has been banned from the server for 1 year (until ${banExpiresTimestamp}).`,
            ));

            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Actioned by:** ${author.displayName}\n` +
                `**Timestamp:** ${timestamp}`,
            ));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });

            const dmContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## You Have Been Banned'));
            dmContainer.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

            dmContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `<@${applicantId}>, your application was denied.\n\n` +
                'You may appeal this decision through the appropriate channels. https://appeal.gg/casf',
            ));

            await member.user.send({ flags: MessageFlags.IsComponentsV2, components: [dmContainer] }).catch(() => null);
            await guild.bans.create(applicantId, { reason: 'Application denied during review' });

            // Store timed ban in database
            await prisma.timedBan.upsert({
                where: {
                    userDiscordId_guildId: {
                        userDiscordId: applicantId,
                        guildId: guild.id,
                    },
                },
                update: {
                    banExpiresAt: banExpiresAt,
                },
                create: {
                    userDiscordId: applicantId,
                    guildId: guild.id,
                    banExpiresAt: banExpiresAt,
                },
            });

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

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ Ban Failed'));
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** An error occurred while banning the applicant.\n**Action:** Please try again or contact an administrator.'));

            await interaction.update({ flags: MessageFlags.IsComponentsV2, components: [container] });
        }
    },
};

export default button;
