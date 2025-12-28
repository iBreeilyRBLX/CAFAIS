/* eslint-disable no-inline-comments */
import { ApplicationCommandType, ContextMenuCommandBuilder, Locale } from 'discord.js';
// i18n removed: fallback to plain string
import { MessageContextMenu } from '../../interfaces';

// Example message context menu

const contextMenu: MessageContextMenu = {
    options: new ContextMenuCommandBuilder()
        .setName('Count Characters')
        .setType(ApplicationCommandType.Message)
        .setDMPermission(false),
    global: false,
    execute: async (_client, interaction) => {
        const message = interaction.targetMessage,
            length = message.content.length;
        await interaction.reply({ content: `User ${message.author.username} has ${length} characters.`, ephemeral: true });
    },
};
export default contextMenu;