import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { Button } from '../../../interfaces';

const button: Button = {
    name: 'startApplication',
    execute: async (_client, interaction) => {
        // Create the application modal

        const modal = new ModalBuilder()
            .setCustomId('applicationModal')
            .setTitle('Application Form');

        const reasonInput = new TextInputBuilder()
            .setCustomId('applicationReason')
            .setLabel('Why do you want to enlist?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024);

        const foundserver = new TextInputBuilder()
            .setCustomId('foundserver')
            .setLabel('How did you find this server?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const age = new TextInputBuilder()
            .setCustomId('age')
            .setLabel('How old are you?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const reasonActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
        const foundserverActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(foundserver);
        const ageActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(age);

        modal.addComponents(reasonActionRow, foundserverActionRow, ageActionRow);

        await interaction.showModal(modal);
    },
};

export default button;
