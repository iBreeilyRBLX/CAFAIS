import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Mark attendance for an event')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true),
        ),
    async execute(interaction: CommandInteraction) {
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
        let event = await prisma.event.findFirst({ where: { name: eventName } });
        if (!event) {
            event = await prisma.event.create({ data: { name: eventName, eventType: 'Other', eventHostDiscordId: discordId, startTime: new Date() } });
        }
        const attendance = await prisma.eventAttendance.upsert({
            where: { userDiscordId_eventId: { userDiscordId: user.discordId, eventId: event.id } },
            update: { attendedAt: new Date() },
            create: { userDiscordId: user.discordId, eventId: event.id },
        });
        await interaction.reply(`Attendance marked for event: **${eventName}**`);
    },
};
