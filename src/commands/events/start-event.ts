import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

const EVENT_TYPES = [
    'Combat Patrol',
    'Money Grinding',
    'Training',
    'Lore',
    'Other',
];

class StartEventCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
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
        ) as SlashCommandBuilder;
    public global = false;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
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
        await prisma.event.create({
            data: {
                name: typeof name === 'string' ? name : String(name),
                eventType: typeof eventType === 'string' ? eventType : String(eventType),
                eventHostDiscordId: interaction.user.id,
                notes: typeof notes === 'string' ? notes : notes ? String(notes) : null,
                imageLink: typeof imageLink === 'string' ? imageLink : imageLink ? String(imageLink) : null,
                startTime: now,
            },
        });
        await interaction.editReply(`Event **${name}** of type **${eventType}** started at ${now.toLocaleString()}`);
    }
}

export default new StartEventCommand();
