import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

console.log('DATABASE_URL at runtime:', process.env.DATABASE_URL);
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('academy-log')
        .setDescription('Academy log for training officers (shows recent training events)'),
    async execute(interaction: CommandInteraction) {
    // Only allow users with the 'Training Officer' role
        const member = interaction.member;
        if (!member || typeof member !== 'object' || !('roles' in member) || typeof member.roles !== 'object' || !('cache' in member.roles) ||
            !member.roles.cache.some((role: any) => role.name === 'Training Officer')) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }
        const events = await prisma.event.findMany({
            where: { eventType: 'Training' },
            orderBy: { startTime: 'desc' },
            take: 10,
            include: { participants: { include: { user: true } } },
        });
        if (!events.length) {
            await interaction.reply('No recent training events found.');
            return;
        }
        const embed = {
            title: 'Recent Training Events',
            fields: events.map(ev => ({
                name: `${ev.name} (${ev.startTime.toLocaleString()})`,
                value: `Participants: ${ev.participants.map(p => p.user.username).join(', ') || 'None'} | Points: ${ev.pointsAwarded ?? 0}\nNotes: ${ev.notes || 'None'}\nImage: ${ev.imageLink || 'None'}`,
            })),
        };
        await interaction.reply({ embeds: [embed] });
    },
};
