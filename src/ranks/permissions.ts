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
