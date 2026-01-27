/**
 * @fileoverview Type definitions for event management system
 * @module types/events
 */

import { User } from 'discord.js';

/**
 * Valid event types supported by the system
 */
export enum EventType {
    COMBAT_PATROL = 'Combat Patrol',
    MONEY_GRINDING = 'Money Grinding',
    TRAINING = 'Training',
    ACADEMY_TRAINING = 'Academy Training',
    LORE = 'Lore',
    OTHER = 'Other',
}

/**
 * Configuration for event point calculation
 */
export interface EventPointConfig {
    basePerHour: number;
    bonusPer30Min: number;
    maxPoints: number;
    description: string;
}

/**
 * Event points configuration mapped by event type
 */
export interface EventPointsConfig {
    eventTypes: Record<string, EventPointConfig>;
}

/**
 * Participant information with promotion status
 */
export interface ParticipantInfo {
    user: User;
    discordId: string;
    username: string;
    promoted: boolean;
    failed: boolean;
    points: number;
}

/**
 * Options for extra participants in events
 */
export interface ExtraParticipant {
    user: User;
}

/**
 * Result of event point calculation
 */
export interface PointCalculationResult {
    points: number;
    durationMs: number;
    hours: number;
    minutes: number;
}

/**
 * Event logging information
 */
export interface EventLogData {
    eventName: string;
    eventType: string;
    hostId: string;
    hostUsername: string;
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
    participants: ParticipantInfo[];
    pointsAwarded?: number;
    notes?: string;
    imageLink?: string;
}

/**
 * Academy training log specific data
 */
export interface AcademyLogData extends EventLogData {
    promotedCount: number;
    failedCount: number;
}
