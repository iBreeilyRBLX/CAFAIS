import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { ranks } from '../../ranks/ranks';

class ProfileCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your user profile') as SlashCommandBuilder;
    public global = true;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const discordId = interaction.user.id;
        let profile = await prisma.userProfile.findUnique({
            where: { discordId },
            include: { verifiedUser: true },
        });
        if (!profile) {
            await prisma.userProfile.create({
                data: {
                    discordId,
                    username: interaction.user.username,
                    discriminator: interaction.user.discriminator,
                },
            });
            profile = await prisma.userProfile.findUnique({
                where: { discordId },
                include: { verifiedUser: true },
            });
        }
        if (!profile) {
            await interaction.editReply('Profile not found or could not be created.');
            return;
        }

        // Get current rank
        let currentRank = 'No Rank';
        try {
            const member = await interaction.guild?.members.fetch(discordId);
            if (member) {
                const userRank = ranks.find(rank => member.roles.cache.has(rank.discordRoleId));
                if (userRank) {
                    currentRank = `${userRank.prefix} - ${userRank.name}`;
                }
            }
        }
        catch (error) {
            console.warn(`Could not fetch member data for ${discordId}:`, error);
        }

        // Get active cooldowns
        const cooldowns = await prisma.rankCooldown.findMany({
            where: {
                userDiscordId: discordId,
                cooldownUntil: {
                    gt: new Date(),
                },
            },
            orderBy: {
                cooldownUntil: 'asc',
            },
        });

        let cooldownStatus = 'No active cooldowns';
        if (cooldowns.length > 0) {
            const nextCooldown = cooldowns[0];
            const timeRemaining = nextCooldown.cooldownUntil.getTime() - Date.now();
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            cooldownStatus = `${nextCooldown.rank}: ${days}d ${hours}h ${mins}m remaining (${cooldowns.length} total)`;
        }

        // Get rank lock status
        const rankLocks = await prisma.rankLock.findMany({
            where: { userDiscordId: discordId },
        });

        let rankLockStatus = 'Not locked';
        if (rankLocks.length > 0) {
            rankLockStatus = `Locked at: ${rankLocks.map(l => l.rank).join(', ')}`;
        }

        // Build container
        const container = new ContainerBuilder();

        // Title
        const title = new TextDisplayBuilder()
            .setContent(`# ${profile.username}#${profile.discriminator}`);
        container.addTextDisplayComponents(title);

        // User ID
        const userInfo = new TextDisplayBuilder()
            .setContent(`**Discord ID:** ${profile.discordId}`);
        container.addTextDisplayComponents(userInfo);

        // Separator
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Ranking Info
        const rankingInfo = new TextDisplayBuilder()
            .setContent(
                `**Current Rank:** ${currentRank}\n` +
                `**Points:** ${profile.points}\n` +
                `**Cooldown Status:** ${cooldownStatus}\n` +
                `**Rank Lock Status:** ${rankLockStatus}`,
            );
        container.addTextDisplayComponents(rankingInfo);

        // Separator
        const separator2 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator2);

        // Roblox Verification Info
        const robloxInfo = new TextDisplayBuilder()
            .setContent(
                `**Roblox User ID:** ${profile.verifiedUser?.robloxId?.toString() || 'Not linked'}\n` +
                `**Roblox Username:** ${profile.verifiedUser?.robloxUsername || 'Not linked'}\n` +
                `**Roblox Display Name:** ${profile.verifiedUser?.robloxDisplayName || 'Not linked'}`,
            );
        container.addTextDisplayComponents(robloxInfo);

        // Separator
        const separator3 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator3);

        // Account Timestamps
        const timestamps = new TextDisplayBuilder()
            .setContent(
                `**Created:** <t:${Math.floor(profile.createdAt.getTime() / 1000)}:F>\n` +
                `**Last Updated:** <t:${Math.floor(profile.updatedAt.getTime() / 1000)}:F>`,
            );
        container.addTextDisplayComponents(timestamps);

        await interaction.editReply({
            components: [container],
        });
    }
}

export default new ProfileCommand();
