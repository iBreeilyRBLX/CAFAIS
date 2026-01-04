import { CommandInteraction, SlashCommandBuilder, GuildMember, VoiceChannel, EmbedBuilder } from 'discord.js';
import prisma from '../../database/prisma';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';

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
        // Discord.js v14: options is CommandInteractionOptionResolver
        // Use getString for string options
        // @ts-ignore
        const name = interaction.options.getString ? interaction.options.getString('name') : interaction.options.get('name')?.value;
        // @ts-ignore
        const eventType = interaction.options.getString ? interaction.options.getString('eventtype') : interaction.options.get('eventtype')?.value;
        // Only allow non-lore events
        if (eventType === 'Lore') {
            await interaction.reply({ content: 'Use /end-lore-event for lore events.', ephemeral: true });
            return;
        }
        const event = await prisma.event.findFirst({ where: { name, eventType, endTime: null } });
        if (!event) {
            await interaction.reply({ content: 'No active event found with that name and type.', ephemeral: true });
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
            await prisma["eventParticipant"].upsert({
                where: { eventId_userDiscordId: { eventId: event.id, userDiscordId: profile.discordId } },
                update: { points },
                create: { eventId: event.id, userDiscordId: profile.discordId, points },
            });
            await prisma.userProfile.update({ where: { discordId: profile.discordId }, data: { points: { increment: points } } });
        }
        // Optionally allow updating notes and imageLink at end
        // @ts-expect-error: getString exists on CommandInteractionOptionResolver
        const notes = interaction.options.getString ? interaction.options.getString('notes') : interaction.options.get('notes')?.value || undefined;
        // @ts-expect-error: getString exists on CommandInteractionOptionResolver
        const imageLink = interaction.options.getString ? interaction.options.getString('image') : interaction.options.get('image')?.value || undefined;
        await prisma.event.update({ where: { id: event.id }, data: { endTime: now, pointsAwarded: points, notes, imageLink } });
        await interaction.reply(`Event **${name}** ended. Duration: ${(durationMs / 60000).toFixed(0)} min. Each participant awarded **${points}** points.`);

        // Log event to channel
        // If you want to log the event, you can import and use logEvent here with your client instance
    },
};
