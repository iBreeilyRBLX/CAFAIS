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
    // Find the highest rank the user has
    const userRank: Rank | undefined = ranks.find(rank => member.roles.cache.has(rank.discordRoleId));
    if (!userRank) return false;
    // Load the permission set JSON
    const permPath = path.resolve(__dirname, userRank.permissionSet);
    if (!fs.existsSync(permPath)) return false;
    const permSet: PermissionSet = JSON.parse(fs.readFileSync(permPath, 'utf-8'));
    if (permSet.type === '.INCLUDE') {
        return permSet.commands.includes('*') || permSet.commands.includes(commandName);
    }
    else if (permSet.type === '.EXCEPT') {
        return !permSet.commands.includes(commandName);
    }
    return false;
}
