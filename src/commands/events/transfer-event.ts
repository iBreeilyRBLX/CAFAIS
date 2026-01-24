/**
 * @fileoverview Transfer Event Command - Transfer event ownership to another user
 * @module commands/events/transfer-event
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { findActiveEventByHost, transferEvent } from '../../services';
import { logger } from '../../utilities/logger';

class TransferEventCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('transfer-event')
        .setDescription('Transfer your active event to another user (Officer+)')
        .addUserOption(option =>
            option.setName('newhost')
                .setDescription('User to transfer the event to')
                .setRequired(true),
        ) as SlashCommandBuilder;

    public global = false;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        // Check officer+ permission
        if (!(await checkAndReplyPerms(interaction, 'transfer-event'))) {
            return;
        }

        const member = interaction.member as GuildMember;
        if (!member) {
            await interaction.editReply({ content: 'Unable to verify your permissions.' });
            return;
        }

        const newHost = interaction.options.getUser('newhost', true);
        const newHostMember = await interaction.guild?.members.fetch(newHost.id).catch(() => null);

        if (!newHostMember) {
            await interaction.editReply({ content: '❌ Could not find the specified user in this server.' });
            return;
        }

        // Prevent transferring to yourself
        if (newHost.id === interaction.user.id) {
            await interaction.editReply({ content: '❌ You cannot transfer an event to yourself.' });
            return;
        }

        try {
            // Find the user's active event
            const event = await findActiveEventByHost(interaction.user.id);

            if (!event) {
                await interaction.editReply({
                    content: '❌ You do not have any active events to transfer.',
                });
                return;
            }

            // Check if new host already has an active event
            const newHostExistingEvent = await findActiveEventByHost(newHost.id);
            if (newHostExistingEvent) {
                await interaction.editReply({
                    content: `❌ <@${newHost.id}> already has an active event (**${newHostExistingEvent.eventType}** started at ${new Date(newHostExistingEvent.startTime).toLocaleString()}). They must end it first.`,
                });
                return;
            }

            // Transfer the event
            await transferEvent(event.id, newHost.id);

            await interaction.editReply({
                content: `✅ **Event Transferred**\n\n` +
                         `**Event:** ${event.name} (${event.eventType})\n` +
                         `**From:** <@${interaction.user.id}>\n` +
                         `**To:** <@${newHost.id}>\n\n` +
                         `<@${newHost.id}> can now end this event and award points.`,
            });

            logger.info('transfer-event', `Event ${event.id} transferred from ${interaction.user.id} to ${newHost.id}`);
        }
        catch (error) {
            logger.error('transfer-event', 'Failed to transfer event', error);
            await interaction.editReply({
                content: '❌ Failed to transfer event. Please try again or contact an administrator.',
            });
        }
    }
}

export default new TransferEventCommand();
