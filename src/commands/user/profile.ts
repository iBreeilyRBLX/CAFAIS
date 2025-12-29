import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

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
        await interaction.editReply({
            embeds: [
                {
                    title: `${profile.username}#${profile.discriminator}`,
                    description: `ID: ${profile.discordId}`,
                    fields: [
                        { name: 'Points', value: profile.points.toString(), inline: true },
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
