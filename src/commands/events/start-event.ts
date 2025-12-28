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
        // Use getString if available, fallback to old method
        // @ts-ignore
        const name = interaction.options.getString ? interaction.options.getString('name') : interaction.options.get('name')?.value;
        // @ts-ignore
        const eventType = interaction.options.getString ? interaction.options.getString('eventtype') : interaction.options.get('eventtype')?.value;
        // @ts-ignore
        const notes = interaction.options.getString ? interaction.options.getString('notes') : interaction.options.get('notes')?.value || undefined;
        // @ts-ignore
        const imageLink = interaction.options.getString ? interaction.options.getString('image') : interaction.options.get('image')?.value || undefined;
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
