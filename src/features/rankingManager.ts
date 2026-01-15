/**
 * @fileoverview Centralized ranking and promotion management system
 * @module features/rankingManager
 *
 * This module handles all promotion, demotion, and rank management operations
 * with cooldown enforcement, point requirements, role management, and logging.
 */

import { Client, GuildMember } from 'discord.js';
import prisma from '../database/prisma';
import { ranks } from '../ranks/ranks';
import { rankRequirements } from '../ranks/cooldowns';
import {
    PromotionStatus,
    PromotionResult,
    PromotionRequest,
    PromotionLogData,
} from '../types/ranking';
import { logPromotion } from './discordLogger';

/**
 * Gets rank information by prefix
 * @param prefix - Rank prefix (e.g., 'PVT', 'SGT')
 * @returns Rank information or undefined if not found
 */
export function getRankByPrefix(prefix: string): typeof ranks[0] | undefined {
    return ranks.find(r => r.prefix === prefix);
}

/**
 * Gets rank index in hierarchy (lower index = higher rank)
 * @param prefix - Rank prefix
 * @returns Index or -1 if not found
 */
export function getRankIndex(prefix: string): number {
    return ranks.findIndex(r => r.prefix === prefix);
}

/**
 * Checks if a rank exists in the hierarchy
 * @param prefix - Rank prefix
 * @returns True if rank exists
 */
export function isValidRank(prefix: string): boolean {
    return getRankIndex(prefix) !== -1;
}

/**
 * Gets the next rank in hierarchy (promotion)
 * @param currentPrefix - Current rank prefix
 * @returns Next rank prefix or undefined if at top
 */
export function getNextRank(currentPrefix: string): string | undefined {
    const currentIndex = getRankIndex(currentPrefix);
    // Already at top or invalid
    if (currentIndex <= 0) {
        return undefined;
    }
    return ranks[currentIndex - 1].prefix;
}

/**
 * Gets the previous rank in hierarchy (demotion)
 * @param currentPrefix - Current rank prefix
 * @returns Previous rank prefix or undefined if at bottom
 */
export function getPreviousRank(currentPrefix: string): string | undefined {
    const currentIndex = getRankIndex(currentPrefix);
    if (currentIndex === -1 || currentIndex >= ranks.length - 1) return undefined;
    return ranks[currentIndex + 1].prefix;
}

/**
 * Checks if user has an active cooldown for promotion from current rank
 * @param userDiscordId - Discord user ID
 * @param currentRank - Current rank prefix
 * @returns Cooldown remaining in milliseconds, or 0 if no cooldown
 */
export async function checkCooldown(userDiscordId: string, currentRank: string): Promise<number> {
    try {
        const cooldownRecord = await prisma.rankCooldown.findFirst({
            where: {
                userDiscordId,
                rank: currentRank,
                cooldownUntil: {
                    gt: new Date(),
                },
            },
            orderBy: {
                cooldownUntil: 'desc',
            },
        });

        if (!cooldownRecord) return 0;

        const remaining = cooldownRecord.cooldownUntil.getTime() - Date.now();
        return remaining > 0 ? remaining : 0;
    }
    catch (error) {
        console.error('[rankingManager] Error checking cooldown:', error);
        throw error;
    }
}

/**
 * Checks if user is locked at a specific rank
 * @param userDiscordId - Discord user ID
 * @param rank - Rank prefix to check
 * @returns True if user is rank-locked
 */
export async function isRankLocked(userDiscordId: string, rank: string): Promise<boolean> {
    try {
        const lockRecord = await prisma.rankLock.findFirst({
            where: {
                userDiscordId,
                rank,
            },
        });

        return lockRecord !== null;
    }
    catch (error) {
        console.error('[rankingManager] Error checking rank lock:', error);
        throw error;
    }
}

/**
 * Gets user's current points from database
 * @param userDiscordId - Discord user ID
 * @returns Current points or 0 if user profile not found
 */
export async function getUserPoints(userDiscordId: string): Promise<number> {
    try {
        const profile = await prisma.userProfile.findUnique({
            where: { discordId: userDiscordId },
            select: { points: true },
        });

        return profile?.points ?? 0;
    }
    catch (error) {
        console.error('[rankingManager] Error fetching user points:', error);
        throw error;
    }
}

/**
 * Creates or updates cooldown for a user at a specific rank
 * @param userDiscordId - Discord user ID
 * @param rank - Rank prefix
 * @param cooldownDays - Cooldown duration in days
 */
async function setCooldown(userDiscordId: string, rank: string, cooldownDays: number): Promise<void> {
    try {
        const cooldownUntil = new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000);

        await prisma.rankCooldown.create({
            data: {
                userDiscordId,
                rank,
                cooldownUntil,
            },
        });
    }
    catch (error) {
        console.error('[rankingManager] Error setting cooldown:', error);
        throw error;
    }
}

/**
 * Removes old rank role and adds new rank role to member
 * @param member - Guild member to update
 * @param oldRankPrefix - Old rank prefix (to remove role)
 * @param newRankPrefix - New rank prefix (to add role)
 * @throws Error if role operations fail
 */
async function updateRankRoles(
    member: GuildMember,
    oldRankPrefix: string | undefined,
    newRankPrefix: string,
): Promise<void> {
    try {
        const newRankInfo = getRankByPrefix(newRankPrefix);
        if (!newRankInfo) {
            throw new Error(`Invalid new rank prefix: ${newRankPrefix}`);
        }

        const newRole = await member.guild.roles.fetch(newRankInfo.discordRoleId);
        if (!newRole) {
            throw new Error(`New rank role not found: ${newRankInfo.discordRoleId}`);
        }

        // Remove old rank role if specified
        if (oldRankPrefix) {
            const oldRankInfo = getRankByPrefix(oldRankPrefix);
            if (oldRankInfo) {
                const oldRole = await member.guild.roles.fetch(oldRankInfo.discordRoleId);
                if (oldRole && member.roles.cache.has(oldRole.id)) {
                    await member.roles.remove(oldRole);
                }
            }
        }

        // Add new rank role
        await member.roles.add(newRole);
    }
    catch (error) {
        console.error('[rankingManager] Error updating rank roles:', error);
        throw error;
    }
}

/**
 * Validates promotion request and checks all requirements
 * @param request - Promotion request
 * @returns Validation result
 */
async function validatePromotion(request: PromotionRequest): Promise<PromotionResult> {
    const { targetUser, toRank, fromRank, bypassCooldown, bypassPoints } = request;

    // Validate target rank
    if (!isValidRank(toRank)) {
        return {
            status: PromotionStatus.INVALID_RANK,
            success: false,
            userId: targetUser.id,
            message: `Invalid rank: ${toRank}`,
        };
    }

    // Check rank lock
    if (fromRank && await isRankLocked(targetUser.id, fromRank)) {
        return {
            status: PromotionStatus.RANK_LOCKED,
            success: false,
            userId: targetUser.id,
            fromRank,
            toRank,
            message: `User is locked at rank ${fromRank}`,
        };
    }

    // Check cooldown (unless bypassed)
    if (fromRank && !bypassCooldown) {
        const cooldownRemaining = await checkCooldown(targetUser.id, fromRank);
        if (cooldownRemaining > 0) {
            const hoursRemaining = Math.ceil(cooldownRemaining / (1000 * 60 * 60));
            return {
                status: PromotionStatus.COOLDOWN_ACTIVE,
                success: false,
                userId: targetUser.id,
                fromRank,
                toRank,
                cooldownRemaining,
                message: `Cooldown active. ${hoursRemaining} hours remaining`,
            };
        }
    }

    // Check point requirements (unless bypassed)
    if (!bypassPoints) {
        const requirement = rankRequirements[toRank];
        if (requirement) {
            const userPoints = await getUserPoints(targetUser.id);
            if (userPoints < requirement.minPoints) {
                const pointsNeeded = requirement.minPoints - userPoints;
                return {
                    status: PromotionStatus.INSUFFICIENT_POINTS,
                    success: false,
                    userId: targetUser.id,
                    fromRank,
                    toRank,
                    pointsNeeded,
                    message: `Insufficient points. Need ${pointsNeeded} more points`,
                };
            }
        }
    }

    return {
        status: PromotionStatus.SUCCESS,
        success: true,
        userId: targetUser.id,
        fromRank,
        toRank,
        message: 'Promotion validated',
    };
}

/**
 * Promotes a user to a specified rank with full validation and logging
 * @param client - Discord client instance
 * @param request - Promotion request details
 * @returns Promotion result
 *
 * @example
 * const result = await promoteUser(client, {
 *   targetMember: member,
 *   targetUser: user,
 *   toRank: Rank.PVT,
 *   fromRank: Rank.INT,
 *   executorId: interaction.user.id,
 *   executorUsername: interaction.user.username,
 *   reason: 'Completed academy training',
 * });
 */
export async function promoteUser(
    client: Client,
    request: PromotionRequest,
): Promise<PromotionResult> {
    try {
        // Validate promotion
        const validation = await validatePromotion(request);
        if (!validation.success) {
            return validation;
        }

        const { targetMember, targetUser, toRank, fromRank, executorId, executorUsername, reason } = request;

        // Update roles
        try {
            await updateRankRoles(targetMember, fromRank, toRank);
        }
        catch (error) {
            console.error('[rankingManager] Role update failed:', error);
            return {
                status: PromotionStatus.ROLE_ERROR,
                success: false,
                userId: targetUser.id,
                fromRank,
                toRank,
                message: `Failed to update roles: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }

        // Set cooldown for new rank
        const requirement = rankRequirements[toRank];
        if (requirement && requirement.cooldownDays > 0) {
            await setCooldown(targetUser.id, toRank, requirement.cooldownDays);
        }

        // Log promotion to Discord
        const logData: PromotionLogData = {
            userId: targetUser.id,
            username: targetUser.username,
            userTag: targetUser.tag,
            fromRank: fromRank || 'N/A',
            toRank,
            executorId,
            executorUsername,
            reason,
            timestamp: new Date(),
        };

        await logPromotion(client, logData);

        return {
            status: PromotionStatus.SUCCESS,
            success: true,
            userId: targetUser.id,
            fromRank,
            toRank,
            message: `Successfully promoted ${targetUser.tag} from ${fromRank || 'N/A'} to ${toRank}`,
        };
    }
    catch (error) {
        console.error('[rankingManager] Promotion failed:', error);
        return {
            status: PromotionStatus.DATABASE_ERROR,
            success: false,
            userId: request.targetUser.id,
            fromRank: request.fromRank,
            toRank: request.toRank,
            message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Batch promotes multiple users (useful for academy training)
 * @param client - Discord client instance
 * @param requests - Array of promotion requests
 * @returns Array of promotion results
 */
export async function batchPromoteUsers(
    client: Client,
    requests: PromotionRequest[],
): Promise<PromotionResult[]> {
    const results: PromotionResult[] = [];

    for (const request of requests) {
        const result = await promoteUser(client, request);
        results.push(result);
    }

    return results;
}

