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
    MessageFlags,
} from 'discord.js';
import { EventLogData, AcademyLogData } from '../types/events';
import { PromotionLogData, DemotionLogData } from '../types/ranking';
import configJSON from '../config.json';

/**
 * Discord channel IDs for logging (from centralized config)
 */
export const LOG_CHANNELS = {
    PROMOTIONS: configJSON.channels.promotionLogs,
    EVENTS: configJSON.channels.eventLogs,
} as const;

/**
 * Batching configuration
 */
// 10 seconds
const BATCH_FLUSH_DELAY_MS = 10000;

/**
 * Buffer for batching promotion logs
 */
const promotionBuffer: PromotionLogData[] = [];
let promotionFlushTimer: NodeJS.Timeout | null = null;

/**
 * Buffer for batching demotion logs
 */
const demotionBuffer: DemotionLogData[] = [];
let demotionFlushTimer: NodeJS.Timeout | null = null;

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
 * Logs a promotion to the promotions channel with batching
 * @param client - Discord client instance
 * @param data - Promotion log data
 * @remarks Promotions are buffered and sent in batches after a short delay
 */
export function logPromotion(client: Client, data: PromotionLogData): void {
    // Add to buffer
    promotionBuffer.push(data);

    // Clear existing timer if any
    if (promotionFlushTimer) {
        clearTimeout(promotionFlushTimer);
    }

    // Set new flush timer
    promotionFlushTimer = setTimeout(async () => {
        await flushPromotionLogs(client);
    }, BATCH_FLUSH_DELAY_MS);
}

/**
 * Flushes all buffered promotion logs to Discord
 * @param client - Discord client instance
 */
async function flushPromotionLogs(client: Client): Promise<void> {
    if (promotionBuffer.length === 0) return;

    try {
        const channel = await client.channels.fetch(LOG_CHANNELS.PROMOTIONS);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Promotions log channel ${LOG_CHANNELS.PROMOTIONS} not found or invalid`);
        }

        // Copy buffer and clear it
        const logsToSend = [...promotionBuffer];
        promotionBuffer.length = 0;
        promotionFlushTimer = null;

        // Main title
        const titleDisplay = new TextDisplayBuilder()
            .setContent(
                logsToSend.length === 1
                    ? '# 📈 Promotion Log'
                    : '# 📈 Batch Promotion Log',
            );

        // Create main container with green accent for success (0x2ECC71)
        const container = new ContainerBuilder()
            .setAccentColor(0x2ECC71);

        // Summary header
        const summary = new TextDisplayBuilder()
            .setContent(
                '## Promotion Summary\n' +
                `**Total Promotions:** ${logsToSend.length}\n` +
                `**Recorded:** ${formatDiscordTimestamp(new Date())}`,
            );
        container.addTextDisplayComponents(summary);

        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Group promotions by rank transition
        const groupedByRank = new Map<string, PromotionLogData[]>();
        for (const log of logsToSend) {
            const key = `${log.fromRank} → ${log.toRank}`;
            if (!groupedByRank.has(key)) {
                groupedByRank.set(key, []);
            }
            const arr = groupedByRank.get(key);
            if (arr) arr.push(log);
        }

        // Build content for each group
        const groups = Array.from(groupedByRank.entries());
        for (let i = 0; i < groups.length; i++) {
            const [transition, logs] = groups[i];

            if (i > 0) {
                const separator = new SeparatorBuilder({
                    spacing: SeparatorSpacingSize.Small,
                    divider: true,
                });
                container.addSeparatorComponents(separator);
            }

            // Group header with emoji
            const groupHeader = new TextDisplayBuilder()
                .setContent(`### ⬆️ ${transition}\n*${logs.length} ${logs.length > 1 ? 'promotions' : 'promotion'}*`);
            container.addTextDisplayComponents(groupHeader);

            // Individual promotions in this group
            let promotionsList = '';
            for (const log of logs) {
                promotionsList += `**<@${log.userId}>**\n`;
                promotionsList += `├ 👤 By: <@${log.executorId}>\n`;
                promotionsList += `├ 📝 Reason: *${log.reason || 'No reason provided'}*\n`;
                promotionsList += `├ 🕐 ${formatDiscordTimestamp(log.timestamp)}`;
                if (log.pointsAwarded) {
                    promotionsList += `\n└ ⭐ Points: **+${log.pointsAwarded}**`;
                }
                else {
                    promotionsList += '\n';
                }
                promotionsList += '\n\n';
            }
            
            const details = new TextDisplayBuilder()
                .setContent(promotionsList.trim());
            container.addTextDisplayComponents(details);
        }

        // Send container message
        await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
    catch (error) {
        console.error('[discordLogger] Failed to flush promotion logs:', error);
        // Clear buffer even on error to prevent infinite retries
        promotionBuffer.length = 0;
        promotionFlushTimer = null;
    }
}

/**
 * Logs a demotion to the promotions channel with batching
 * @param client - Discord client instance
 * @param data - Demotion log data
 * @remarks Demotions are buffered and sent in batches after a short delay
 */
export function logDemotion(client: Client, data: DemotionLogData): void {
    // Add to buffer
    demotionBuffer.push(data);

    // Clear existing timer if any
    if (demotionFlushTimer) {
        clearTimeout(demotionFlushTimer);
    }

    // Set new flush timer
    demotionFlushTimer = setTimeout(async () => {
        await flushDemotionLogs(client);
    }, BATCH_FLUSH_DELAY_MS);
}

/**
 * Flushes all buffered demotion logs to Discord
 * @param client - Discord client instance
 */
async function flushDemotionLogs(client: Client): Promise<void> {
    if (demotionBuffer.length === 0) return;

    try {
        const channel = await client.channels.fetch(LOG_CHANNELS.PROMOTIONS);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Promotions log channel ${LOG_CHANNELS.PROMOTIONS} not found or invalid`);
        }

        // Copy buffer and clear it
        const logsToSend = [...demotionBuffer];
        demotionBuffer.length = 0;
        demotionFlushTimer = null;

        // Main title
        const titleDisplay = new TextDisplayBuilder()
            .setContent(
                logsToSend.length === 1
                    ? '# 📉 Demotion Log'
                    : '# 📉 Batch Demotion Log',
            );

        // Create main container with red accent for demotions (0xE74C3C)
        const container = new ContainerBuilder()
            .setAccentColor(0xE74C3C);

        // Summary header
        const summary = new TextDisplayBuilder()
            .setContent(
                '## Demotion Summary\n' +
                `**Total Demotions:** ${logsToSend.length}\n` +
                `**Recorded:** ${formatDiscordTimestamp(new Date())}`,
            );
        container.addTextDisplayComponents(summary);

        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Group demotions by rank transition
        const groupedByRank = new Map<string, DemotionLogData[]>();
        for (const log of logsToSend) {
            const key = `${log.fromRank} → ${log.toRank}`;
            if (!groupedByRank.has(key)) {
                groupedByRank.set(key, []);
            }
            const arr = groupedByRank.get(key);
            if (arr) arr.push(log);
        }

        // Build content for each group
        const groups = Array.from(groupedByRank.entries());
        for (let i = 0; i < groups.length; i++) {
            const [transition, logs] = groups[i];

            if (i > 0) {
                const separator = new SeparatorBuilder({
                    spacing: SeparatorSpacingSize.Small,
                    divider: true,
                });
                container.addSeparatorComponents(separator);
            }

            // Group header with emoji
            const groupHeader = new TextDisplayBuilder()
                .setContent(`### ⬇️ ${transition}\n*${logs.length} ${logs.length > 1 ? 'demotions' : 'demotion'}*`);
            container.addTextDisplayComponents(groupHeader);

            // Individual demotions in this group
            let demotionsList = '';
            for (const log of logs) {
                demotionsList += `**<@${log.userId}>** *(${log.userTag})*\n`;
                demotionsList += `├ 👤 By: <@${log.executorId}> (${log.executorUsername})\n`;
                demotionsList += `├ 📝 Reason: *${log.reason}*\n`;
                demotionsList += `└ 🕐 ${formatDiscordTimestamp(log.timestamp)}\n\n`;
            }
            
            const details = new TextDisplayBuilder()
                .setContent(demotionsList.trim());
            container.addTextDisplayComponents(details);
        }

        // Send message with title and container
        await channel.send({ components: [titleDisplay, container], flags: MessageFlags.IsComponentsV2 });
    }
    catch (error) {
        console.error('[discordLogger] Failed to flush demotion logs:', error);
        // Clear buffer even on error to prevent infinite retries
        demotionBuffer.length = 0;
        demotionFlushTimer = null;
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

        // Main title
        const titleDisplay = new TextDisplayBuilder()
            .setContent('# 🎯 Event Completed');

        // Create header container with yellow accent for events (0xF39C12)
        const headerContainer = new ContainerBuilder()
            .setAccentColor(0xF39C12);
        
        const eventTitle = new TextDisplayBuilder()
            .setContent(`## ${data.eventName}`);
        headerContainer.addTextDisplayComponents(eventTitle);

        const headerSeparator = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        headerContainer.addSeparatorComponents(headerSeparator);

        // Event details with emojis
        const duration = data.durationMs ? formatDuration(data.durationMs) : 'N/A';
        const details = new TextDisplayBuilder()
            .setContent(
                `**📋 Type:** ${data.eventType}\n` +
                `**👤 Host:** <@${data.hostId}> (${data.hostUsername})\n` +
                `**🕐 Started:** ${formatDiscordTimestamp(data.startTime)}\n` +
                (data.endTime ? `**🕐 Ended:** ${formatDiscordTimestamp(data.endTime)}\n` : '') +
                `**⏱️ Duration:** ${duration}\n` +
                `**👥 Participants:** ${data.participants.length}` +
                (data.pointsAwarded !== undefined ? `\n**⭐ Points:** ${data.pointsAwarded} per participant` : ''),
            );
        headerContainer.addTextDisplayComponents(details);

        // Notes in separate section if present
        if (data.notes) {
            const notesSeparator = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            headerContainer.addSeparatorComponents(notesSeparator);

            const notesText = new TextDisplayBuilder()
                .setContent(`**📝 Notes:**\n*${data.notes}*`);
            headerContainer.addTextDisplayComponents(notesText);
        }

        // Create participants container with blue accent (0x3498DB)
        let participantsContainer: ContainerBuilder | null = null;
        if (data.participants.length > 0) {
            participantsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            const participantsTitle = new TextDisplayBuilder()
                .setContent('## 👥 Event Participants');
            participantsContainer.addTextDisplayComponents(participantsTitle);

            const participantsSeparator = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            participantsContainer.addSeparatorComponents(participantsSeparator);

            const participantsList = data.participants
                .map(p => `• <@${p.discordId}> — **${p.points}** pts`)
                .join('\n');

            const participantsText = new TextDisplayBuilder()
                .setContent(participantsList);
            participantsContainer.addTextDisplayComponents(participantsText);
        }

        // Create image container if provided (orange accent - 0xE67E22)
        let imageContainer: ContainerBuilder | null = null;
        if (data.imageLink) {
            imageContainer = new ContainerBuilder()
                .setAccentColor(0xE67E22);

            const imageText = new TextDisplayBuilder()
                .setContent(`## 📷 Event Media\n[View Event Image](${data.imageLink})`);
            imageContainer.addTextDisplayComponents(imageText);
        }

        // Assemble all components
        const components = [titleDisplay, headerContainer];
        if (participantsContainer) {
            components.push(participantsContainer);
        }
        if (imageContainer) {
            components.push(imageContainer);
        }

        // Send message with all containers
        await channel.send({ components, flags: MessageFlags.IsComponentsV2 });
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
        const TRAINING_LOG_CHANNEL = '1454639944348864574';
        const channel = await client.channels.fetch(TRAINING_LOG_CHANNEL);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error(`Training log channel ${TRAINING_LOG_CHANNEL} not found or invalid`);
        }

        // Create header container with accent color (blue for academy - 0x3498DB)
        const headerContainer = new ContainerBuilder()
            .setAccentColor(0x3498DB);
        
        const eventTitle = new TextDisplayBuilder()
            .setContent(`## ${data.eventName}`);
        headerContainer.addTextDisplayComponents(eventTitle);

        const headerSeparator = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        headerContainer.addSeparatorComponents(headerSeparator);

        // Host and timing information
        const duration = data.durationMs ? formatDuration(data.durationMs) : 'N/A';
        const hostInfo = new TextDisplayBuilder()
            .setContent(
                `**👤 Host:** <@${data.hostId}> (${data.hostUsername})\n` +
                `**🕐 Started:** ${formatDiscordTimestamp(data.startTime)}\n` +
                (data.endTime ? `**🕐 Ended:** ${formatDiscordTimestamp(data.endTime)}\n` : '') +
                `**⏱️ Duration:** ${duration}`,
            );
        headerContainer.addTextDisplayComponents(hostInfo);

        // Create stats container with accent color (green for success - 0x2ECC71)
        const statsContainer = new ContainerBuilder()
            .setAccentColor(0x2ECC71);

        const statsTitle = new TextDisplayBuilder()
            .setContent('## 📊 Training Results');
        statsContainer.addTextDisplayComponents(statsTitle);

        const statsSeparator = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        statsContainer.addSeparatorComponents(statsSeparator);

        const stats = new TextDisplayBuilder()
            .setContent(
                `**👥 Total Participants:** ${data.participants.length}\n` +
                `**✅ Promoted to Private:** ${data.promotedCount} (2 points each)\n` +
                `**❌ Failed:** ${data.failedCount} (0 points)\n` +
                `**⭐ Points Awarded:** ${data.promotedCount * 2}`,
            );
        statsContainer.addTextDisplayComponents(stats);

        // Create participants container with accent color (purple - 0x9B59B6)
        const participantsContainer = new ContainerBuilder()
            .setAccentColor(0x9B59B6);

        const participantsTitle = new TextDisplayBuilder()
            .setContent('## 👥 Participants Breakdown');
        participantsContainer.addTextDisplayComponents(participantsTitle);

        const participantsSeparator = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        participantsContainer.addSeparatorComponents(participantsSeparator);

        if (data.participants.length > 0) {
            const promotedList = data.participants.filter(p => p.promoted);
            const failedList = data.participants.filter(p => p.failed);
            const otherList = data.participants.filter(p => !p.promoted && !p.failed);

            let participantContent = '';

            if (promotedList.length > 0) {
                participantContent += `**✅ Promoted (${promotedList.length}):**\n`;
                participantContent += promotedList.map(p => `• <@${p.discordId}> (+${p.points} pts)`).join('\n');
                participantContent += '\n\n';
            }

            if (failedList.length > 0) {
                participantContent += `**❌ Failed (${failedList.length}):**\n`;
                participantContent += failedList.map(p => `• <@${p.discordId}>`).join('\n');
                participantContent += '\n\n';
            }

            if (otherList.length > 0) {
                participantContent += `**👤 Other Attendees (${otherList.length}):**\n`;
                participantContent += otherList.map(p => `• <@${p.discordId}>`).join('\n');
            }

            const participantsText = new TextDisplayBuilder()
                .setContent(participantContent.trim());
            participantsContainer.addTextDisplayComponents(participantsText);
        }

        // Create notes/image container if applicable (orange accent - 0xE67E22)
        let notesContainer: ContainerBuilder | null = null;
        if (data.notes || data.imageLink) {
            notesContainer = new ContainerBuilder()
                .setAccentColor(0xE67E22);

            const notesTitle = new TextDisplayBuilder()
                .setContent('## 📝 Additional Information');
            notesContainer.addTextDisplayComponents(notesTitle);

            const notesSeparator = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            notesContainer.addSeparatorComponents(notesSeparator);

            let notesContent = '';
            if (data.notes) {
                notesContent += `**📄 Notes:**\n${data.notes}`;
            }
            if (data.imageLink) {
                if (notesContent) notesContent += '\n\n';
                notesContent += `**📷 Event Image:** [View Image](${data.imageLink})`;
            }

            const notesText = new TextDisplayBuilder()
                .setContent(notesContent);
            notesContainer.addTextDisplayComponents(notesText);
        }

        // Main title with academy emoji
        const titleDisplay = new TextDisplayBuilder()
            .setContent('# 🎓 Academy Training Log');

        // Assemble all components
        const components = [titleDisplay, headerContainer, statsContainer, participantsContainer];
        if (notesContainer) {
            components.push(notesContainer);
        }

        // Send message with all containers
        await channel.send({ components, flags: MessageFlags.IsComponentsV2 });
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
