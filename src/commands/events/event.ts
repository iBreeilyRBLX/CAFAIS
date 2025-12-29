
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

class EventCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('event')
        .setDescription('Mark attendance for an event')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true),
        ) as SlashCommandBuilder;
    public global = false;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const discordId = interaction.user.id;
        // Use getString if available, fallback to old method
        // @ts-ignore
        const eventName = interaction.options.getString ? interaction.options.getString('name') : interaction.options.get('name')?.value;
        let user = await prisma.userProfile.findUnique({ where: { discordId } });
        if (!user) {
            user = await prisma.userProfile.create({
                data: {
                    discordId,
                    username: interaction.user.username,
                    discriminator: interaction.user.discriminator,
                },
            });
        }
        let event = await prisma.event.findFirst({ where: { name: typeof eventName === 'string' ? eventName : String(eventName) } });
        if (!event) {
            event = await prisma.event.create({ data: { name: typeof eventName === 'string' ? eventName : String(eventName), eventType: 'Other', eventHostDiscordId: discordId, startTime: new Date() } });
        }
        await prisma.eventAttendance.upsert({
            where: { userDiscordId_eventId: { userDiscordId: user.discordId, eventId: event.id } },
            update: { attendedAt: new Date() },
            create: { userDiscordId: user.discordId, eventId: event.id },
        });
        await interaction.editReply(`Attendance marked for event: **${eventName}**`);
    }
}

export default new EventCommand();
