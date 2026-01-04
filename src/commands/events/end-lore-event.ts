import { CommandInteraction, SlashCommandBuilder, GuildMember, VoiceChannel } from 'discord.js';
import prisma from '../../database/prisma';

function calculateLorePoints(durationMs: number) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const mins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    let points = hours * 3;
    points += Math.floor(mins / 30) * 1;
    return points;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end-lore-event')
        .setDescription('End a lore event and award lore points')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true),
        ),
    async execute(interaction: CommandInteraction) {
        // @ts-ignore
        const name = interaction.options.getString ? interaction.options.getString('name') : interaction.options.get('name')?.value;
        const event = await prisma.event.findFirst({ where: { name, eventType: 'Lore', endTime: null } });
        if (!event) {
            await interaction.reply({ content: 'No active lore event found with that name.', ephemeral: true });
            return;
        }
        const now = new Date();
        const durationMs = now.getTime() - new Date(event.startTime).getTime();
        // Lore event points: 1 hour = 3 points, every 30 min = +1 point
        const base = 3, per30 = 1;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const mins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        let points = hours * base;
        points += Math.floor(mins / 30) * per30;
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
        // @ts-ignore
        const notes = interaction.options.getString ? interaction.options.getString('notes') : interaction.options.get('notes')?.value || undefined;
        // @ts-ignore
        const imageLink = interaction.options.getString ? interaction.options.getString('image') : interaction.options.get('image')?.value || undefined;
        await prisma.event.update({ where: { id: event.id }, data: { endTime: now, pointsAwarded: points, notes, imageLink } });
        await interaction.reply(`Lore event **${name}** ended. Duration: ${(durationMs / 60000).toFixed(0)} min. Each participant awarded **${points}** lore points.`);
    },
};
