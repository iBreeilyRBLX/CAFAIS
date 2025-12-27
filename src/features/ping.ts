import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js';
// Example button (localization removed)
export function getPingButton() {
    const pingButton = new ButtonBuilder()
        .setCustomId('ping')
        .setLabel('Ping')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)
        .setEmoji('🏓');
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(pingButton);
}