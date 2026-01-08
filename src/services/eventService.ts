/**
 * @fileoverview Event service layer for database operations
 * @module services/eventService
 */

import { User } from 'discord.js';
import prisma from '../database/prisma';

/**
 * Creates a new event in the database
 * @param eventType - Type of event
 * @param hostDiscordId - Discord ID of event host
 * @returns Created event object
 */
export async function createEvent(eventType: string, hostDiscordId: string) {
    const now = new Date();
    return prisma.event.create({
        data: {
            name: `${eventType} - ${now.toLocaleString()}`,
            eventType,
            eventHostDiscordId: hostDiscordId,
            startTime: now,
        },
    });
}

/**
 * Finds the most recent active event by name and type
 * @param name - Event name
 * @param eventType - Event type
 * @returns Event object or null if not found
 */
export async function findActiveEventByNameAndType(name: string, eventType: string) {
    return prisma.event.findFirst({
        where: { name, eventType, endTime: null },
        orderBy: { startTime: 'desc' },
    });
}

/**
 * Finds the most recent active event by type
 * @param eventType - Event type
 * @returns Event object or null if not found
 */
export async function findActiveEventByType(eventType: string) {
    return prisma.event.findFirst({
        where: { eventType, endTime: null },
        orderBy: { startTime: 'desc' },
    });
}

/**
 * Finds the most recent active event by type and host
 * @param eventType - Event type
 * @param hostDiscordId - Discord ID of event host
 * @returns Event object or null if not found
 */
export async function findActiveEventByTypeAndHost(eventType: string, hostDiscordId: string) {
    return prisma.event.findFirst({
        where: { eventType, eventHostDiscordId: hostDiscordId, endTime: null },
        orderBy: { startTime: 'desc' },
    });
}

/**
 * Ends an event and updates it in the database
 * @param eventId - Event ID (String UUID) to end
 * @param pointsAwarded - Points to award per participant
 * @param notes - Optional event notes
 * @param imageLink - Optional event image URL
 * @returns Updated event object
 */
export async function endEvent(
    eventId: string,
    pointsAwarded: number,
    notes?: string,
    imageLink?: string,
) {
    return prisma.event.update({
        where: { id: eventId },
        data: {
            endTime: new Date(),
            pointsAwarded,
            notes: notes || null,
            imageLink: imageLink || null,
        },
    });
}

/**
 * Creates or updates a user profile
 * @param discordId - Discord user ID
 * @param username - Username
 * @param discriminator - Discord discriminator
 * @param pointsIncrement - Points to increment (optional)
 * @returns User profile object
 */
export async function upsertUserProfile(
    discordId: string,
    username: string,
    discriminator: string,
    pointsIncrement = 0,
) {
    return prisma.userProfile.upsert({
        where: { discordId },
        update: {
            username,
            discriminator,
            points: pointsIncrement > 0 ? { increment: pointsIncrement } : undefined,
        },
        create: {
            discordId,
            username,
            discriminator: discriminator || '0',
            points: pointsIncrement,
        },
    });
}

/**
 * Creates or updates an event participant record
 * @param eventId - Event ID (String UUID)
 * @param userDiscordId - User Discord ID
 * @param points - Points to award
 * @returns Event participant record
 */
export async function upsertEventParticipant(
    eventId: string,
    userDiscordId: string,
    points: number,
) {
    return prisma.eventParticipant.upsert({
        where: { eventId_userDiscordId: { eventId, userDiscordId } },
        update: { points },
        create: { eventId, userDiscordId, points },
    });
}

/**
 * Awards points to a participant
 * @param eventId - Event ID (String UUID)
 * @param user - Discord user
 * @param points - Points to award
 */
export async function awardPointsToParticipant(
    eventId: string,
    user: User,
    points: number,
): Promise<void> {
    // Create or update user profile
    await upsertUserProfile(user.id, user.username, user.discriminator || '0', points);

    // Create event participant record
    await upsertEventParticipant(eventId, user.id, points);
}

