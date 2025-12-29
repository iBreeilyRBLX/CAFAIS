import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

function calculateLorePoints(durationMs: number) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const mins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    let points = hours * 3;
    points += Math.floor(mins / 30) * 1;
    return points;
}

class EndLoreEventCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('end-lore-event')
        .setDescription('End a lore event and award lore points')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true),
        ) as SlashCommandBuilder;
    public global = false;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        // @ts-ignore
        const name = interaction.options.getString ? interaction.options.getString('name') : interaction.options.get('name')?.value;
        const event = await prisma.event.findFirst({ where: { name: typeof name === 'string' ? name : String(name), eventType: 'Lore', endTime: null } });
        if (!event) {
            await interaction.editReply({ content: 'No active lore event found with that name.' });
            return;
        }
        const now = new Date();
        const durationMs = now.getTime() - new Date(event.startTime).getTime();
        const points = calculateLorePoints(durationMs);
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
            await prisma["eventParticipant"].upsert({
                where: { eventId_userDiscordId: { eventId: event.id, userDiscordId: profile.discordId } },
                update: { points },
                create: { eventId: event.id, userDiscordId: profile.discordId, points },
            });
        }
        await prisma.event.update({ where: { id: event.id }, data: { endTime: now, pointsAwarded: points } });
        await interaction.editReply(`Lore event **${name}** ended. Points awarded: **${points}**`);
    }
}

export default new EndLoreEventCommand();
