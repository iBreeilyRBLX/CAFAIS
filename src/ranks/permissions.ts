import { GuildMember } from 'discord.js';
import { ranks, Rank } from '../ranks/ranks';
import * as path from 'path';
import * as fs from 'fs';

interface PermissionSet {
  type: '.INCLUDE' | '.EXCEPT';
  commands: string[];
}

/**
 * Checks if a user can run a command based on their highest rank and the group permission set.
 * @param member Discord GuildMember
 * @param commandName The command to check (e.g. 'end-event')
 * @returns boolean
 */
export async function hasCommandPermission(member: GuildMember, commandName: string): Promise<boolean> {
    const userRank: Rank | undefined = ranks.find(rank => member.roles.cache.has(rank.discordRoleId));
    if (!userRank) {
        return false;
    }

    // Resolve permission file with several fallbacks (prefer src paths, then dist)
    const filename = path.basename(userRank.permissionSet);
    const candidatePaths = [
        // Source locations (preferred)
        path.resolve(process.cwd(), 'src', 'rank-permissions', filename),
        path.resolve(process.cwd(), 'src', 'ranks', 'rank-permissions', filename),
        path.resolve(process.cwd(), 'src', 'ranks', 'rank-permmisions', filename),
        // Dist-adjacent paths
        path.resolve(__dirname, '..', 'rank-permissions', filename),
        path.resolve(__dirname, userRank.permissionSet),
    ];

    const permPath = candidatePaths.find(p => fs.existsSync(p));

    if (!permPath) {
        console.warn(`[perm] Permission file not found for rank ${userRank.name}. Tried: ${candidatePaths.join(', ')}`);
        return false;
    }

    let permSet: PermissionSet;
    try {
        permSet = JSON.parse(fs.readFileSync(permPath, 'utf-8')) as PermissionSet;
    }
    catch (error) {
        console.error(`[perm] Failed to parse permissions for rank ${userRank.name} from ${permPath}`, error);
        return false;
    }

    if (permSet.type === '.INCLUDE') {
        return permSet.commands.includes('*') || permSet.commands.includes(commandName);
    }

    if (permSet.type === '.EXCEPT') {
        return !permSet.commands.includes(commandName);
    }

    console.warn(`[perm] Unknown permission set type for rank ${userRank.name}: ${permSet.type}`);
    return false;
}

/**
 * Checks if a user can promote someone to a specific rank based on their promotion limits.
 * @param executorMember Discord GuildMember performing the promotion
 * @param targetRankPrefix The rank prefix they want to promote to (e.g., 'PVT', 'SGT')
 * @returns { canPromote: boolean, reason?: string, maxRank?: string }
 */
export function canPromoteToRank(
    executorMember: GuildMember,
    targetRankPrefix: string,
): { canPromote: boolean; reason?: string; maxRank?: string } {
    // Find executor's rank
    const executorRank: Rank | undefined = ranks.find(rank => executorMember.roles.cache.has(rank.discordRoleId));
    if (!executorRank) {
        return { canPromote: false, reason: 'You do not have a rank' };
    }

    // Find target rank
    const targetRank = ranks.find(r => r.prefix === targetRankPrefix);
    if (!targetRank) {
        return { canPromote: false, reason: 'Invalid target rank' };
    }

    // Get executor and target rank indices (lower index = higher rank)
    const executorIndex = ranks.findIndex(r => r.prefix === executorRank.prefix);
    const targetIndex = ranks.findIndex(r => r.prefix === targetRankPrefix);

    // Cannot promote to a rank equal or higher than your own
    if (targetIndex <= executorIndex) {
        return {
            canPromote: false,
            reason: `You cannot promote to ${targetRank.name} (equal or higher than your rank)`,
        };
    }

    // Check if executor has a promotion limit
    if (executorRank.maxPromoteToPrefix) {
        const maxPromoteToIndex = ranks.findIndex(r => r.prefix === executorRank.maxPromoteToPrefix);

        if (maxPromoteToIndex === -1) {
            console.warn(`[perm] Invalid maxPromoteToPrefix for rank ${executorRank.name}: ${executorRank.maxPromoteToPrefix}`);
            return { canPromote: false, reason: 'Invalid promotion configuration' };
        }

        // Target rank must be at or below the max promotion rank (higher index = lower rank)
        if (targetIndex < maxPromoteToIndex) {
            const maxRank = ranks[maxPromoteToIndex];
            return {
                canPromote: false,
                reason: `Your rank can only promote up to ${maxRank.name}`,
                maxRank: maxRank.name,
            };
        }
    }

    // If no maxPromoteToPrefix, can promote to any rank below their own
    return { canPromote: true };
}
