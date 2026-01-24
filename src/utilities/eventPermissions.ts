/**
 * @fileoverview Event permission validation utilities
 * @module utilities/eventPermissions
 */

import { GuildMember } from 'discord.js';
import configJSON from '../config.json';

/**
 * Role IDs for event-specific permissions (from centralized config)
 */
export const EVENT_ROLE_IDS = {
    TRAINING_DEPARTMENT: configJSON.roles.departments.training,
    LORE_DEPARTMENT: configJSON.roles.departments.lore,
} as const;

/**
 * Permission check result type
 */
export interface PermissionCheckResult {
    allowed: boolean;
    error?: string;
}

/**
 * Validates if user has permission to start specific event type
 * @param member - Guild member attempting the action
 * @param eventType - Type of event
 * @param hasNcoPermission - Whether user has NCO+ rank permission
 * @returns Permission validation result
 * @example
 * // Training department member can start Academy Training
 * validateEventTypePermission(member, 'Academy Training', false); // { allowed: true }
 * // NCO+ can start Combat Patrol
 * validateEventTypePermission(member, 'Combat Patrol', true); // { allowed: true }
 */
export function validateEventTypePermission(
    member: GuildMember,
    eventType: string,
    hasNcoPermission: boolean,
): PermissionCheckResult {
    const roles = member.roles.cache;

    // Academy Training - Training Department only
    if (eventType === 'Academy Training') {
        if (!roles.has(EVENT_ROLE_IDS.TRAINING_DEPARTMENT)) {
            return {
                allowed: false,
                error: 'Academy Training events can only be started by Training Department members.',
            };
        }
        return { allowed: true };
    }

    // Lore - Lore Department only
    if (eventType === 'Lore') {
        if (!roles.has(EVENT_ROLE_IDS.LORE_DEPARTMENT)) {
            return {
                allowed: false,
                error: 'Lore events can only be started by Lore Department members.',
            };
        }
        return { allowed: true };
    }

    // Other event types - NCO+ required
    if (!hasNcoPermission) {
        return {
            allowed: false,
            error: 'You need to be NCO+ or Training Department to start this event type.',
        };
    }

    return { allowed: true };
}

/**
 * Checks if user has Training Department role
 * @param member - Guild member to check
 * @returns True if member has Training Department role
 */
export function hasTrainingDepartmentRole(member: GuildMember): boolean {
    return member.roles.cache.has(EVENT_ROLE_IDS.TRAINING_DEPARTMENT);
}

/**
 * Checks if user has Lore Department role
 * @param member - Guild member to check
 * @returns True if member has Lore Department role
 */
export function hasLoreDepartmentRole(member: GuildMember): boolean {
    return member.roles.cache.has(EVENT_ROLE_IDS.LORE_DEPARTMENT);
}
