import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EVENT_TYPES = [
    'Combat Patrol',
    'Money Grinding',
    'Training',
    'Lore',
    'Other',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-event')
        .setDescription('Start a new event')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('eventtype')
                .setDescription('Type of event')
                .setRequired(true)
                .addChoices(...EVENT_TYPES.map(type => ({ name: type, value: type }))),
        )
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Event notes')
                .setRequired(false),
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image link for the event')
                .setRequired(false),
        ),
    async execute(interaction: CommandInteraction) {
        const name = interaction.options.get('name')?.value as string;
        const eventType = interaction.options.get('eventtype')?.value as string;
        const notes = interaction.options.get('notes')?.value as string | undefined;
        const imageLink = interaction.options.get('image')?.value as string | undefined;
        const now = new Date();
        const event = await prisma.event.create({
            data: {
                name,
                eventType,
                eventHostDiscordId: interaction.user.id,
                notes,
                imageLink,
                startTime: now,
            },
        });
        await interaction.reply(`Event **${name}** of type **${eventType}** started at ${now.toLocaleString()}`);
    },
};
