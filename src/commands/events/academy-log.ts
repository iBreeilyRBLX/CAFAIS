import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

class AcademyLogCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('academy-log')
        .setDescription('Academy log for training officers (shows recent training events)') as SlashCommandBuilder;
    public global = false;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        // Only allow users with the 'Training Officer' role
        const member = interaction.member;
        if (!member || typeof member !== 'object' || !('roles' in member) || typeof member.roles !== 'object' || !('cache' in member.roles) ||
            !member.roles.cache.some((role: any) => role.name === 'Training Officer')) {
            await interaction.editReply({ content: 'You do not have permission to use this command.' });
            return;
        }
        const events = await prisma.event.findMany({
            where: { eventType: 'Training' },
            orderBy: { startTime: 'desc' },
            take: 10,
            include: { participants: { include: { user: true } } },
        });
        if (!events.length) {
            await interaction.editReply('No recent training events found.');
            return;
        }
        const embed = {
            title: 'Recent Training Events',
            fields: events.map(ev => ({
                name: `${ev.name} (${ev.startTime.toLocaleString()})`,
                value: `Participants: ${ev.participants.map(p => p.user.username).join(', ') || 'None'} | Points: ${ev.pointsAwarded ?? 0}\nNotes: ${ev.notes || 'None'}\nImage: ${ev.imageLink || 'None'}`,
            })),
        };
        await interaction.editReply({ embeds: [embed] });
    }
}

export default new AcademyLogCommand();
