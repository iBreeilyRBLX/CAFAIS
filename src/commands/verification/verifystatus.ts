import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

class VerifyStatusCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('account-data')
        .setDescription('View all account data we hold on you for transparency.') as SlashCommandBuilder;

    public global = true;

    public isEphemeral(): boolean {
        return true;
    }

    public async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const discordId = interaction.user.id;
        // Fetch all relevant data for the user
        const profile = await prisma.userProfile.findUnique({
            where: { discordId },
            include: {
                verifiedUser: true,
                eventParticipants: {
                    include: { event: true },
                    orderBy: { event: { startTime: 'desc' } },
                },
                awards: { orderBy: { awardedAt: 'desc' } },
                loaRecords: true,
                rankCooldowns: true,
                rankLocks: true,
                applicationSubmissions: true,
            },
        });

        // Timed bans are not directly on profile, so fetch separately
        const timedBans = await prisma.timedBan.findMany({ where: { userDiscordId: discordId } });

        if (!profile) {
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder().setContent('No data found for your account.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
            return;
        }

        const container = new ContainerBuilder().setAccentColor(0x2ECC40);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## Your Data Overview'),
        );
        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );
        // Discord Info
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '### Discord Information\n' +
                `**Username:** ${profile.username}#${profile.discriminator}\n` +
                `**User ID:** ${profile.discordId}`,
            ),
        );
        // Roblox Info
        if (profile.verifiedUser) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('### Roblox Information'),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**Username:** ${profile.verifiedUser.robloxUsername}\n` +
                    `**Display Name:** ${profile.verifiedUser.robloxDisplayName}\n` +
                    `**User ID:** ${profile.verifiedUser.robloxId.toString()}\n` +
                    `**Verified:** <t:${Math.floor(profile.verifiedUser.verifiedAt.getTime() / 1000)}:R>`,
                ),
            );
        }
        // Activity Data
        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('### Activity Data'),
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Points:** ${profile.points}\n` +
                `**Events Attended:** ${profile.eventParticipants.filter(p => !p.failed).length}\n` +
                `**Events Failed:** ${profile.eventParticipants.filter(p => p.failed).length}\n` +
                `**Total Participation:** ${profile.eventParticipants.length}`,
            ),
        );
        // Awards
        if (profile.awards.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### Awards (${profile.awards.length})`),
            );
            const awardList = profile.awards.slice(0, 5).map(award => {
                return `**${award.name}**${award.description ? ` - *${award.description}*` : ''}\n   └ <t:${Math.floor(award.awardedAt.getTime() / 1000)}:d>`;
            }).join('\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(awardList),
            );
        }
        // LOA Records
        if (profile.loaRecords.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### LOA Records (${profile.loaRecords.length})`),
            );
            const loaList = profile.loaRecords.slice(0, 3).map(loa => {
                return `**Reason:** ${loa.reason}\n**Start:** <t:${Math.floor(new Date(loa.startDate).getTime() / 1000)}:d>\n**End:** <t:${Math.floor(new Date(loa.endDate).getTime() / 1000)}:d>`;
            }).join('\n---\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(loaList),
            );
        }
        // Rank Cooldowns
        if (profile.rankCooldowns.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### Rank Cooldowns (${profile.rankCooldowns.length})`),
            );
            const cooldownList = profile.rankCooldowns.map(cd => {
                return `**Rank:** ${cd.rank}\n**Until:** <t:${Math.floor(new Date(cd.cooldownUntil).getTime() / 1000)}:R>`;
            }).join('\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(cooldownList),
            );
        }
        // Rank Locks
        if (profile.rankLocks.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### Rank Locks (${profile.rankLocks.length})`),
            );
            const lockList = profile.rankLocks.map(lock => {
                return `**Rank:** ${lock.rank}\n**Locked At:** <t:${Math.floor(new Date(lock.lockedAt).getTime() / 1000)}:d>\n${lock.reason ? `**Reason:** ${lock.reason}` : ''}`;
            }).join('\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(lockList),
            );
        }
        // Application Submissions
        if (profile.applicationSubmissions.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### Application Submissions (${profile.applicationSubmissions.length})`),
            );
            const appList = profile.applicationSubmissions.map(app => {
                return `**Submitted:** <t:${Math.floor(new Date(app.createdAt).getTime() / 1000)}:d>\n**Pending:** ${app.isPending ? 'Yes' : 'No'}\n${app.applicationReason ? `**Reason:** ${app.applicationReason}` : ''}`;
            }).join('\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(appList),
            );
        }
        // Timed Bans
        if (timedBans.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### Timed Bans (${timedBans.length})`),
            );
            const banList = timedBans.map(ban => {
                return `**Guild:** ${ban.guildId}\n**Expires:** <t:${Math.floor(new Date(ban.banExpiresAt).getTime() / 1000)}:R>`;
            }).join('\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(banList),
            );
        }
        // Account Info
        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Profile Created:** <t:${Math.floor(profile.createdAt.getTime() / 1000)}:F>\n` +
                `**Last Updated:** <t:${Math.floor(profile.updatedAt.getTime() / 1000)}:R>`,
            ),
        );
        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}

export default new VerifyStatusCommand();
