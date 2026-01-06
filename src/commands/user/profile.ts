import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
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

        await interaction.editReply({
            embeds: [
                {
                    title: `${profile.username}#${profile.discriminator}`,
                    description: `ID: ${profile.discordId}`,
                    fields: [
                        { name: 'Current Rank', value: currentRank, inline: true },
                        { name: 'Points', value: profile.points.toString(), inline: true },
                        { name: 'Cooldown Status', value: cooldownStatus, inline: false },
                        { name: 'Rank Lock Status', value: rankLockStatus, inline: false },
                        { name: 'Roblox User ID', value: profile.verifiedUser?.robloxId?.toString() || 'Not linked', inline: true },
                        { name: 'Roblox Username', value: profile.verifiedUser?.robloxUsername || 'Not linked', inline: true },
                        { name: 'Roblox Display Name', value: profile.verifiedUser?.robloxDisplayName || 'Not linked', inline: true },
                        { name: 'Created', value: profile.createdAt.toISOString(), inline: true },
                        { name: 'Updated', value: profile.updatedAt.toISOString(), inline: true },
                    ],
                },
            ],
        });
    }
}

export default new ProfileCommand();
