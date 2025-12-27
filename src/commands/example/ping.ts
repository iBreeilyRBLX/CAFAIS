import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommand } from '../../interfaces';

// Example slash command (localization removed)
const command: ChatInputCommand = {
    options: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages),
    global: true,
    execute: async (_client, interaction) => {
        interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
    },
};
export default command;