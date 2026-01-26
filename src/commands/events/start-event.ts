/**
 * @fileoverview Start Event Command - Initiates a new event with role-based restrictions
 * @module commands/events/start-event
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import prisma from '../../database/prisma';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { getEventTypes, validateEventTypePermission, hasTrainingDepartmentRole } from '../../utilities';
import { createEvent, findActiveEventByHost } from '../../services';
import { validateEventName } from '../../utilities/validation';
import { logger } from '../../utilities/logger';

class StartEventCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('start-event')
        .setDescription('Start a new event (NCO+ or Training Department)')
        .addStringOption(option =>
            option.setName('eventtype')
                .setDescription('Type of event')
                .setRequired(true)
                .addChoices(
                    ...getEventTypes().map(type => ({ name: type, value: type })),
                ),
        ) as SlashCommandBuilder;

    public global = false;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember;
        if (!member) {
            await interaction.editReply({ content: 'Unable to verify your permissions.' });
            return;
        }

        // Check base NCO+ or Training Department permission
        const hasTrainingRole = hasTrainingDepartmentRole(member);
        const hasNcoPermission = await checkAndReplyPerms(interaction, 'start-event');

        if (!hasNcoPermission && !hasTrainingRole) {
            // Permission check already replied with error
            return;
        }

        // Get command options
        const eventType = interaction.options.getString('eventtype', true);

        // Validate event type permission
        const validation = validateEventTypePermission(member, eventType, hasNcoPermission);
        if (!validation.allowed) {
            await interaction.editReply({ content: validation.error });
            return;
        }

        // Enforce only one active event per host
        const existingActive = await findActiveEventByHost(interaction.user.id);
        if (existingActive) {
            await interaction.editReply({
                content: `❌ You already have an active event (**${existingActive.eventType}** started at ${new Date(existingActive.startTime).toLocaleString()}). End it before starting another.`,
            });
            return;
        }

        // Create event in database
        try {
            const event = await createEvent(eventType, interaction.user.id);
            const now = new Date();

            await interaction.editReply({
                content: `✅ **${eventType}** event started at ${now.toLocaleString()}\.\nEvent ID: ${event.id}`,
            });
        }
        catch (error) {
            console.error('[start-event] Failed to create event:', error);
            await interaction.editReply({
                content: '❌ Failed to start event. Please try again or contact an administrator.',
            });
        }
    }
}

export default new StartEventCommand();
