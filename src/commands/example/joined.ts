import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommand } from '../../interfaces';

const command: ChatInputCommand = {
    options: new SlashCommandBuilder()
        .setName('joined')
        .setDescription('See when you joined this server!')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages),
    global: true,
    execute: async (_client, interaction) => {
        if (!interaction.inGuild()) {
            await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        if (!member || !member.joinedAt) {
            await interaction.reply({ content: 'Could not determine your join date.', ephemeral: true });
            return;
        }
        const joinedDate = `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`;
        await interaction.reply({ content: `You joined this server on ${joinedDate}.`, ephemeral: false });
    },
};
export default command;
