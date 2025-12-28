import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your user profile'),
  async execute(interaction: CommandInteraction) {
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
      await interaction.reply('Profile not found or could not be created.');
      return;
    }
    await interaction.reply({
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
  },
};
