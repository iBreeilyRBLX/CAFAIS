/**
 * @fileoverview Centralized Discord logging utility using Discord.js container builders
 * @module features/discordLogger
 *
 * This module provides functions to log events, promotions, and academy training
 * to designated Discord channels using rich container-based formatting.
 */

import {
    TextChannel,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    Client,
} from 'discord.js';
import { EventLogData, AcademyLogData } from '../types/events';
import { PromotionLogData, DemotionLogData } from '../types/ranking';

/**
 * Discord channel IDs for logging
 */
export const LOG_CHANNELS = {
    PROMOTIONS: '1454639433566519306',
    EVENTS: '1454639394605498449',
} as const;

/**
 * Formats a timestamp for Discord
 * @param date - Date to format
 * @returns Discord timestamp string
 */
function formatDiscordTimestamp(date: Date): string {
    return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
}

/**
 * Formats duration in milliseconds to a human-readable string
 * @param durationMs - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2 hours 30 minutes")
 */
function formatDuration(durationMs: number): string {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const mins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (mins > 0) parts.push(`${mins} minute${mins !== 1 ? 's' : ''}`);
    
    return parts.join(' ') || '0 minutes';
}

/**
 * Logs a promotion to the promotions channel
 * @param client - Discord client instance
 * @param data - Promotion log data
 * @throws Error if channel not found or message fails to send
 */
export async function logPromotion(client: Client, data: PromotionLogData): Promise<void> {
    try {
        const channel = await client.channels.fetch(LOG_CHANNELS.PROMOTIONS);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Promotions log channel ${LOG_CHANNELS.PROMOTIONS} not found or invalid`);
        }

        const container = new ContainerBuilder();

        // Title
        const title = new TextDisplayBuilder()
            .setContent('# 📈 Promotion Logged');
        container.addTextDisplayComponents(title);

        // Separator
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Promotion details
        const details = new TextDisplayBuilder()
            .setContent(
                `**User:** <@${data.userId}> (${data.userTag})\n` +
                `**Promotion:** \`${data.fromRank}\` → \`${data.toRank}\`\n` +
                `**Promoted By:** <@${data.executorId}> (${data.executorUsername})\n` +
                `**Reason:** ${data.reason || 'No reason provided'}\n` +
                `**Timestamp:** ${formatDiscordTimestamp(data.timestamp)}` +
                (data.pointsAwarded ? `\n**Points Awarded:** ${data.pointsAwarded}` : ''),
            );
        container.addTextDisplayComponents(details);

        // Send container message
        await channel.send({ components: container.components });
    }
    catch (error) {
        console.error('[discordLogger] Failed to log promotion:', error);
        throw error;
    }
}

/**
 * Logs a demotion to the promotions channel
 * @param client - Discord client instance
 * @param data - Demotion log data
 * @throws Error if channel not found or message fails to send
 */
export async function logDemotion(client: Client, data: DemotionLogData): Promise<void> {
    try {
        const channel = await client.channels.fetch(LOG_CHANNELS.PROMOTIONS);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Promotions log channel ${LOG_CHANNELS.PROMOTIONS} not found or invalid`);
        }

        const container = new ContainerBuilder();

        // Title
        const title = new TextDisplayBuilder()
            .setContent('# 📉 Demotion Logged');
        container.addTextDisplayComponents(title);

        // Separator
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Demotion details
        const details = new TextDisplayBuilder()
            .setContent(
                `**User:** <@${data.userId}> (${data.userTag})\n` +
                `**Demotion:** \`${data.fromRank}\` → \`${data.toRank}\`\n` +
                `**Demoted By:** <@${data.executorId}> (${data.executorUsername})\n` +
                `**Reason:** ${data.reason}\n` +
                `**Timestamp:** ${formatDiscordTimestamp(data.timestamp)}`,
            );
        container.addTextDisplayComponents(details);

        // Send container message
        await channel.send({ components: container.components });
    }
    catch (error) {
        console.error('[discordLogger] Failed to log demotion:', error);
        throw error;
    }
}

/**
 * Logs an event end to the events channel
 * @param client - Discord client instance
 * @param data - Event log data
 * @throws Error if channel not found or message fails to send
 */
export async function logEvent(client: Client, data: EventLogData): Promise<void> {
    try {
        const channel = await client.channels.fetch(LOG_CHANNELS.EVENTS);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Events log channel ${LOG_CHANNELS.EVENTS} not found or invalid`);
        }

        const container = new ContainerBuilder();

        // Title
        const title = new TextDisplayBuilder()
            .setContent(`# 🎯 Event: ${data.eventName}`);
        container.addTextDisplayComponents(title);

        // Separator
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Event details
        const duration = data.durationMs ? formatDuration(data.durationMs) : 'N/A';
        const details = new TextDisplayBuilder()
            .setContent(
                `**Event Type:** ${data.eventType}\n` +
                `**Host:** <@${data.hostId}> (${data.hostUsername})\n` +
                `**Started:** ${formatDiscordTimestamp(data.startTime)}\n` +
                (data.endTime ? `**Ended:** ${formatDiscordTimestamp(data.endTime)}\n` : '') +
                `**Duration:** ${duration}\n` +
                `**Participants:** ${data.participants.length}\n` +
                (data.pointsAwarded !== undefined ? `**Points Awarded:** ${data.pointsAwarded} per participant\n` : '') +
                (data.notes ? `**Notes:** ${data.notes}\n` : ''),
            );
        container.addTextDisplayComponents(details);

        // Participants list
        if (data.participants.length > 0) {
            const separator2 = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            container.addSeparatorComponents(separator2);

            const participantsList = data.participants
                .map(p => `• <@${p.discordId}> - ${p.points} points`)
                .join('\n');

            const participantsText = new TextDisplayBuilder()
                .setContent(`**Participant List:**\n${participantsList}`);
            container.addTextDisplayComponents(participantsText);
        }

        // Image if provided
        if (data.imageLink) {
            const separator3 = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            container.addSeparatorComponents(separator3);

            const imageText = new TextDisplayBuilder()
                .setContent(`**Event Image:** [View Image](${data.imageLink})`);
            container.addTextDisplayComponents(imageText);
        }

        // Send container message
        await channel.send({ components: container.components });
    }
    catch (error) {
        console.error('[discordLogger] Failed to log event:', error);
        throw error;
    }
}

/**
 * Logs an academy training session to the events channel
 * @param client - Discord client instance
 * @param data - Academy log data
 * @throws Error if channel not found or message fails to send
 */
export async function logAcademyTraining(client: Client, data: AcademyLogData): Promise<void> {
    try {
        const channel = await client.channels.fetch(LOG_CHANNELS.EVENTS);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Events log channel ${LOG_CHANNELS.EVENTS} not found or invalid`);
        }

        const container = new ContainerBuilder();

        // Title
        const title = new TextDisplayBuilder()
            .setContent(`# 🎓 Academy Training: ${data.eventName}`);
        container.addTextDisplayComponents(title);

        // Separator
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Event details
        const duration = data.durationMs ? formatDuration(data.durationMs) : 'N/A';
        const details = new TextDisplayBuilder()
            .setContent(
                `**Host:** <@${data.hostId}> (${data.hostUsername})\n` +
                `**Started:** ${formatDiscordTimestamp(data.startTime)}\n` +
                (data.endTime ? `**Ended:** ${formatDiscordTimestamp(data.endTime)}\n` : '') +
                `**Duration:** ${duration}\n` +
                `**Total Participants:** ${data.participants.length}\n` +
                `**Promoted to Private:** ${data.promotedCount}\n` +
                `**Failed:** ${data.failedCount}\n` +
                (data.notes ? `**Notes:** ${data.notes}\n` : ''),
            );
        container.addTextDisplayComponents(details);

        // Participants list with status
        if (data.participants.length > 0) {
            const separator2 = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            container.addSeparatorComponents(separator2);

            const promotedList = data.participants
                .filter(p => p.promoted)
                .map(p => `✅ <@${p.discordId}> - Promoted to Private (2 points)`)
                .join('\n');

            const failedList = data.participants
                .filter(p => p.failed)
                .map(p => `❌ <@${p.discordId}> - Not Promoted (0 points)`)
                .join('\n');

            let participantsContent = '**Participants:**\n';
            if (promotedList) participantsContent += promotedList + '\n';
            if (failedList) participantsContent += failedList;

            const participantsText = new TextDisplayBuilder()
                .setContent(participantsContent);
            container.addTextDisplayComponents(participantsText);
        }

        // Image if provided
        if (data.imageLink) {
            const separator3 = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            container.addSeparatorComponents(separator3);

            const imageText = new TextDisplayBuilder()
                .setContent(`**Event Image:** [View Image](${data.imageLink})`);
            container.addTextDisplayComponents(imageText);
        }

        // Send container message
        await channel.send({ components: container.components });
    }
    catch (error) {
        console.error('[discordLogger] Failed to log academy training:', error);
        throw error;
    }
}

/**
 * Utility function to safely send a plain text message to a channel
 * @param client - Discord client instance
 * @param channelId - Channel ID to send to
 * @param content - Message content
 */
export async function sendLogMessage(client: Client, channelId: string, content: string): Promise<void> {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Channel ${channelId} not found or invalid`);
        }
        await channel.send({ content });
    }
    catch (error) {
        console.error(`[discordLogger] Failed to send log message to ${channelId}:`, error);
        throw error;
    }
}
