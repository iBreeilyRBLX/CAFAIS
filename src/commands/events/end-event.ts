import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
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

function calculatePoints(durationMs: number, base: number, per30: number) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const mins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    let points = hours * base;
    points += Math.floor(mins / 30) * per30;
    return points;
}

class EndEventCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('end-event')
        .setDescription('End an event and award points')
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
        ) as SlashCommandBuilder;
    public global = false;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(await checkAndReplyPerms(interaction, 'end-event'))) return;
        // @ts-ignore
        const name = interaction.options.getString ? interaction.options.getString('name') : interaction.options.get('name')?.value;
        // @ts-ignore
        const eventType = interaction.options.getString ? interaction.options.getString('eventtype') : interaction.options.get('eventtype')?.value;
        // Only allow non-lore events
        if (eventType === 'Lore') {
            await interaction.editReply({ content: 'Use /end-lore-event for lore events.' });
            return;
        }
        const event = await prisma.event.findFirst({ where: { name: typeof name === 'string' ? name : String(name), eventType: typeof eventType === 'string' ? eventType : String(eventType), endTime: null } });
        if (!event) {
            await interaction.editReply({ content: 'No active event found with that name and type.' });
            return;
        }
        const now = new Date();
        const durationMs = now.getTime() - new Date(event.startTime).getTime();
        // Standard event points: 1 hour = 2 points, every 30 min = +1 point
        const base = 2, per30 = 1;
        const points = calculatePoints(durationMs, base, per30);
        // Get all users in the same voice channel as the command user
        const member = interaction.member as GuildMember;
        const voice = member.voice;
        if (!voice.channel) {
            await interaction.editReply({ content: 'You must be in a voice channel to end the event and collect participants.' });
            return;
        }
        const channel = voice.channel as VoiceChannel;
        const participants = channel.members;
        for (const [, user] of participants) {
            let profile = await prisma.userProfile.findUnique({ where: { discordId: user.id } });
            if (!profile) {
                profile = await prisma.userProfile.create({
                    data: {
                        discordId: user.id,
                        username: user.user.username,
                        discriminator: user.user.discriminator,
                    },
                });
            }
            await prisma.eventParticipant.upsert({
                where: { eventId_userDiscordId: { eventId: event.id, userDiscordId: profile.discordId } },
                update: { points },
                create: { eventId: event.id, userDiscordId: profile.discordId, points },
            });
        }
        await prisma.event.update({ where: { id: event.id }, data: { endTime: now, pointsAwarded: points } });
        await interaction.editReply(`Event **${name}** ended. Points awarded: **${points}**`);
    }
}

export default new EndEventCommand();
