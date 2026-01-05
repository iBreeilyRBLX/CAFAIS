/**
 * @fileoverview Type definitions for ranking and promotion system
 * @module types/ranking
 */

import { GuildMember, User } from 'discord.js';

/**
 * Rank names in the CASF hierarchy
 */
export enum Rank {
    // HICOM
    PRX = 'PRX',
    MAR = 'MAR',
    GEN = 'GEN',
    LTG = 'LTG',
    // Officers
    CMD = 'CMD',
    CPT = 'CPT',
    LTT = 'LTT',
    JLT = 'JLT',
    // NCOs
    CCH = 'CCH',
    CH1 = 'CH1',
    CH2 = 'CH2',
    SPS = 'SPS',
    SSG = 'SSG',
    SGT = 'SGT',
    JSG = 'JSG',
    // Enlisted
    CPL = 'CPL',
    LCP = 'LCP',
    SSP = 'SSP',
    SPV = 'SPV',
    PVT = 'PVT',
    INT = 'INT',
}

/**
 * Promotion result status
 */
export enum PromotionStatus {
    SUCCESS = 'SUCCESS',
    INSUFFICIENT_POINTS = 'INSUFFICIENT_POINTS',
    COOLDOWN_ACTIVE = 'COOLDOWN_ACTIVE',
    RANK_LOCKED = 'RANK_LOCKED',
    INVALID_RANK = 'INVALID_RANK',
    DATABASE_ERROR = 'DATABASE_ERROR',
    ROLE_ERROR = 'ROLE_ERROR',
}

/**
 * Promotion attempt result
 */
export interface PromotionResult {
    status: PromotionStatus;
    success: boolean;
    fromRank?: string;
    toRank?: string;
    userId: string;
    message: string;
    cooldownRemaining?: number;
    pointsNeeded?: number;
}

/**
 * Promotion request information
 */
export interface PromotionRequest {
    targetMember: GuildMember;
    targetUser: User;
    toRank: Rank;
    fromRank?: Rank;
    executorId: string;
    executorUsername: string;
    reason?: string;
    bypassCooldown?: boolean;
    bypassPoints?: boolean;
}

/**
 * Promotion log data for Discord logging
 */
export interface PromotionLogData {
    userId: string;
    username: string;
    userTag: string;
    fromRank: string;
    toRank: string;
    executorId: string;
    executorUsername: string;
    reason?: string;
    timestamp: Date;
    pointsAwarded?: number;
}

/**
 * Demotion log data for Discord logging
 */
export interface DemotionLogData {
    userId: string;
    username: string;
    userTag: string;
    fromRank: string;
    toRank: string;
    executorId: string;
    executorUsername: string;
    reason: string;
    timestamp: Date;
}
