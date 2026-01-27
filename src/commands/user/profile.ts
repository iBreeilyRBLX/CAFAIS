import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { ranks } from '../../ranks/ranks';
import { CUSTOM_EMOJIS } from '../../config/emojis';

class ProfileCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your user profile or another user\'s profile (NCO+)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view profile for (NCO+ only)')
                .setRequired(false),
        ) as SlashCommandBuilder;
    public global = true;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const requestingUserId = interaction.user.id;
        const targetUser = interaction.options.getUser('user');
        const targetDiscordId = targetUser?.id || requestingUserId;
        const isViewingOther = targetDiscordId !== requestingUserId;

        // Check if user has NCO+ permission to view others' profiles
        if (isViewingOther) {
            const member = await interaction.guild?.members.fetch(requestingUserId);
            if (!member) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                errorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## ❌ Error'),
                );

                errorContainer.addSeparatorComponents(
                    new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
                );

                errorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        '**Issue:** Unable to fetch member information.\n' +
                        '**Action:** Please try again or contact support.',
                    ),
                );

                await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                });
                return;
            }

            // Check if user has NCO+ rank permission (uses the nco.json permission set)
            const userRank = ranks.find(rank => member.roles.cache.has(rank.discordRoleId));
            const isNcoOrHigher = userRank && userRank.permissionSet.includes('nco.json') ||
                                  userRank && userRank.permissionSet.includes('officer.json') ||
                                  userRank && userRank.permissionSet.includes('hicom.json') ||
                                  userRank && userRank.permissionSet.includes('bot-dev.json');

            if (!isNcoOrHigher) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                errorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## ❌ Permission Denied'),
                );

                errorContainer.addSeparatorComponents(
                    new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
                );

                errorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        '**Issue:** You need to be NCO+ to view other users\' profiles.\n' +
                        '**Action:** You can only view your own profile.',
                    ),
                );

                await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                });
                return;
            }
        }

        // Fetch or create profile
        let profile = await prisma.userProfile.findUnique({
            where: { discordId: targetDiscordId },
            include: {
                verifiedUser: true,
                eventParticipants: {
                    include: {
                        event: true,
                    },
                    orderBy: {
                        event: {
                            startTime: 'desc',
                        },
                    },
                },
                awards: {
                    orderBy: {
                        awardedAt: 'desc',
                    },
                },
            },
        });

        if (!profile) {
            const targetMember = await interaction.guild?.members.fetch(targetDiscordId);
            await prisma.userProfile.create({
                data: {
                    discordId: targetDiscordId,
                    username: targetMember?.user.username || targetUser?.username || 'Unknown',
                    discriminator: targetMember?.user.discriminator || targetUser?.discriminator || '0',
                },
            });
            profile = await prisma.userProfile.findUnique({
                where: { discordId: targetDiscordId },
                include: {
                    verifiedUser: true,
                    eventParticipants: {
                        include: {
                            event: true,
                        },
                        orderBy: {
                            event: {
                                startTime: 'desc',
                            },
                        },
                    },
                    awards: {
                        orderBy: {
                            awardedAt: 'desc',
                        },
                    },
                },
            });
        }

        if (!profile) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ Error'),
            );

            errorContainer.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '**Issue:** Profile not found or could not be created.\n' +
                    '**Action:** Please try again or contact support.',
                ),
            );

            await interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        // Get current rank
        let currentRank = 'No Rank';
        let rankEmoji = '❓';
        try {
            const member = await interaction.guild?.members.fetch(targetDiscordId);
            if (member) {
                const userRank = ranks.find(rank => member.roles.cache.has(rank.discordRoleId));
                if (userRank) {
                    currentRank = `${userRank.prefix} - ${userRank.name}`;
                    // Set emoji based on rank level
                    if (userRank.permissionSet.includes('hicom.json') || userRank.permissionSet.includes('bot-dev.json')) {
                        rankEmoji = '⭐';
                    }
                    else if (userRank.permissionSet.includes('officer.json')) {
                        rankEmoji = '🎖️';
                    }
                    else if (userRank.permissionSet.includes('nco.json')) {
                        rankEmoji = '🪖';
                    }
                    else {
                        rankEmoji = '🎗️';
                    }
                }
            }
        }
        catch (error) {
            console.warn(`Could not fetch member data for ${targetDiscordId}:`, error);
        }

        // Get active cooldowns
        const cooldowns = await prisma.rankCooldown.findMany({
            where: {
                userDiscordId: targetDiscordId,
                cooldownUntil: {
                    gt: new Date(),
                },
            },
            orderBy: {
                cooldownUntil: 'asc',
            },
        });

        let cooldownStatus = '✅ No active cooldowns';
        if (cooldowns.length > 0) {
            const nextCooldown = cooldowns[0];
            const timeRemaining = nextCooldown.cooldownUntil.getTime() - Date.now();
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            cooldownStatus = `⏰ ${nextCooldown.rank}: ${days}d ${hours}h ${mins}m remaining (${cooldowns.length} total)`;
        }

        // Get rank lock status
        const rankLocks = await prisma.rankLock.findMany({
            where: { userDiscordId: targetDiscordId },
        });

        let rankLockStatus = '✅ Not locked';
        if (rankLocks.length > 0) {
            rankLockStatus = `🔒 Locked at: ${rankLocks.map(l => l.rank).join(', ')}`;
        }

        // Calculate event statistics
        const eventsAttended = profile.eventParticipants.filter(p => !p.failed);
        const eventsFailed = profile.eventParticipants.filter(p => p.failed);
        const eventsHosted = await prisma.event.count({
            where: { eventHostDiscordId: targetDiscordId },
        });

        // Get recent events (last 5)
        const recentEvents = profile.eventParticipants.slice(0, 5);

        // Build container with accent color (Blue for profiles)
        const container = new ContainerBuilder()
            .setAccentColor(0x3498DB);

        // Header section
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## User Profile${isViewingOther ? ` - ${profile.username}` : ''}`,
            ),
        );

        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

        // Basic Info
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `${CUSTOM_EMOJIS.discord.default} **Discord:** ${profile.username}#${profile.discriminator}\n` +
                `**User ID:** ${profile.discordId}\n` +
                `**Current Rank:** ${currentRank}\n` +
                `**Points:** ${profile.points}`,
            ),
        );

        // Roblox Info (if verified)
        if (profile.verifiedUser) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## ${CUSTOM_EMOJIS.roblox.default} Roblox Verification`,
                ),
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

        // Ranking Status
        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## Ranking Status'),
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `${cooldownStatus}\n` +
                `${rankLockStatus}`,
            ),
        );

        // Event Statistics
        container.addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## Event Statistics'),
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Events Attended:** ${eventsAttended.length}\n` +
                `**Events Failed:** ${eventsFailed.length}\n` +
                `**Events Hosted:** ${eventsHosted}\n` +
                `**Total Participation:** ${profile.eventParticipants.length}`,
            ),
        );

        // Recent Events
        if (recentEvents.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## Recent Events'),
            );

            const eventList = recentEvents.map(p => {
                const status = p.failed ? 'FAILED' : 'ATTENDED';
                const points = p.points > 0 ? ` (+${p.points} pts)` : '';
                return `**${p.event.name}** - <t:${Math.floor(p.event.startTime.getTime() / 1000)}:d>${points} [${status}]`;
            }).join('\n');

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(eventList),
            );
        }

        // Medals
        // TODO: Implement medals system in database
        interface Medal {
            name: string;
            description?: string;
            awardedAt: Date;
        }
        const medals: Medal[] = [];
        if (medals.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## Medals (${medals.length})`),
            );

            const medalList = medals.slice(0, 5).map((medal: Medal) => {
                return `**${medal.name}**${medal.description ? ` - *${medal.description}*` : ''}\n   └ <t:${Math.floor(medal.awardedAt.getTime() / 1000)}:d>`;
            }).join('\n');

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(medalList),
            );
        }

        // Awards
        if (profile.awards.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## Awards (${profile.awards.length})`),
            );

            const awardList = profile.awards.slice(0, 5).map(award => {
                return `**${award.name}**${award.description ? ` - *${award.description}*` : ''}\n   └ <t:${Math.floor(award.awardedAt.getTime() / 1000)}:d>`;
            }).join('\n');

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(awardList),
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

export default new ProfileCommand();
