/**
 * @fileoverview Event utility functions for point calculation and participant management
 * @module utilities/eventUtils
 */

import { User, ChatInputCommandInteraction } from 'discord.js';
import { EventPointsConfig } from '../types/events';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads event configuration from JSON file
 * @returns Event configuration with types and point values
 * @throws Error if config file not found or invalid JSON
 */
export function loadEventConfig(): EventPointsConfig {
    const configPath = path.join(__dirname, '../config/eventConfig.json');
    if (!fs.existsSync(configPath)) {
        throw new Error(`Event config file not found at ${configPath}`);
    }
    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData) as EventPointsConfig;
}

/**
 * Gets available event types from configuration
 * @returns Array of event type names
 */
export function getEventTypes(): string[] {
    const config = loadEventConfig();
    return Object.keys(config.eventTypes);
}

/**
 * Validates event type exists in configuration
 * @param eventType - Event type to validate
 * @returns True if event type exists in config
 */
export function isValidEventType(eventType: string): boolean {
    return getEventTypes().includes(eventType);
}

/**
 * Calculates points based on duration and event type multipliers
 * @param durationMs - Event duration in milliseconds
 * @param base - Base points per hour
 * @param per30 - Bonus points per 30 minutes
 * @returns Calculated points
 * @example
 * // 2 hours 30 minutes, base=2, per30=1
 * calculatePoints(9000000, 2, 1) // Returns 5
 */
export function calculatePoints(durationMs: number, base: number, per30: number): number {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const mins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    let points = hours * base;
    points += Math.floor(mins / 30) * per30;
    return points;
}

/**
 * Toggles a user in the participants list
 * Adds user if not present, removes if already present
 * @param participants - Current participants array
 * @param user - User to toggle
 * @returns Updated participants array
 * @example
 * const list = [user1, user2];
 * toggleParticipant(list, user3); // Returns [user1, user2, user3]
 * toggleParticipant(list, user1); // Returns [user2]
 */
export function toggleParticipant(participants: User[], user: User): User[] {
    const index = participants.findIndex(p => p.id === user.id);
    if (index !== -1) {
        return participants.filter((_, i) => i !== index);
    }
    else {
        return [...participants, user];
    }
}

/**
 * Extracts extra participants from interaction options
 * @param interaction - Chat input interaction with extra participant options
 * @returns Array of extra participant users
 */
export function extractExtraParticipants(interaction: ChatInputCommandInteraction): User[] {
    const extraUsers: User[] = [];
    for (let i = 1; i <= 5; i++) {
        const user = interaction.options.getUser(`extraparticipant${i}`);
        if (user) {
            extraUsers.push(user);
        }
    }
    return extraUsers;
}

/**
 * Formats duration in milliseconds to human-readable string
 * @param durationMs - Duration in milliseconds
 * @returns Formatted duration (e.g., "2 hours 30 minutes")
 */
export function formatDuration(durationMs: number): string {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const mins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    if (hours > 0) {
        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    if (mins > 0) {
        parts.push(`${mins} minute${mins !== 1 ? 's' : ''}`);
    }

    return parts.join(' ') || '0 minutes';
}
