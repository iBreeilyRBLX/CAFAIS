import { CommandInteraction, SlashCommandBuilder, GuildMember, VoiceChannel, EmbedBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { logEvent, EventLogType } from '../../features/eventLogger';
import { client } from '../../bot';

const prisma = new PrismaClient();

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

module.exports = {
    data: new SlashCommandBuilder()
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
        ),
    async execute(interaction: CommandInteraction) {
        if (!(await checkAndReplyPerms(interaction, 'end-event'))) return;
        const name = interaction.options.get('name')?.value as string;
        const eventType = interaction.options.get('eventtype')?.value as string;
        const event = await prisma.event.findFirst({ where: { name, eventType, endTime: null } });
        if (!event) {
            await interaction.reply({ content: 'No active event found with that name and type.', ephemeral: true });
            return;
        }
        const now = new Date();
        const durationMs = now.getTime() - event.startTime.getTime();
        let base = 2, per30 = 1;
        if (eventType === 'Lore') { base = 3; per30 = 1; }
        const points = calculatePoints(durationMs, base, per30);
        // Get all users in the same voice channel as the command user
        const member = interaction.member as GuildMember;
        const voice = member.voice;
        if (!voice.channel) {
            await interaction.reply({ content: 'You must be in a voice channel to end the event and collect participants.', ephemeral: true });
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
            await prisma.userProfile.update({ where: { discordId: profile.discordId }, data: { points: { increment: points } } });
        }
        // Optionally allow updating notes and imageLink at end
        const notes = interaction.options.get('notes')?.value as string | undefined;
        const imageLink = interaction.options.get('image')?.value as string | undefined;
        await prisma.event.update({ where: { id: event.id }, data: { endTime: now, pointsAwarded: points, notes, imageLink } });
                await interaction.reply(`Event **${name}** ended. Duration: ${(durationMs/60000).toFixed(0)} min. Each participant awarded **${points}** points.`);

                // Log event to channel
                const embed = new EmbedBuilder()
                    .setTitle(`Event Ended: ${name}`)
                    .addFields(
                        { name: 'Type', value: eventType, inline: true },
                        { name: 'Duration', value: `${(durationMs/60000).toFixed(0)} min`, inline: true },
                        { name: 'Points per participant', value: points.toString(), inline: true },
                        { name: 'Host', value: `<@${event.eventHostDiscordId}>`, inline: true },
                        { name: 'Notes', value: notes || 'None', inline: false },
                        { name: 'Image', value: imageLink || 'None', inline: false },
                    )
                    .setTimestamp(now);
                if (imageLink) embed.setImage(imageLink);
                await logEvent(client, EventLogType.EVENT, embed);
    },
};
