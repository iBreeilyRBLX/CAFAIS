/**
 * @fileoverview Participant collection and filtering utilities
 * @module utilities/participantUtils
 */

import { GuildMember, User, VoiceChannel, ChatInputCommandInteraction } from 'discord.js';
import { toggleParticipant, extractExtraParticipants } from './eventUtils';

/**
 * Collects all members from a voice channel
 * @param channel - Voice channel to collect from
 * @returns Array of guild members in the channel
 */
export function collectVoiceChannelMembers(channel: VoiceChannel): GuildMember[] {
    return Array.from(channel.members.values());
}

/**
 * Collects members with a specific role from a voice channel
 * @param channel - Voice channel to collect members from
 * @param roleId - Role ID to filter by
 * @returns Array of guild members with the role
 */
export function collectMembersWithRole(channel: VoiceChannel, roleId: string): GuildMember[] {
    return Array.from(channel.members.values()).filter(member => member.roles.cache.has(roleId));
}


/**
 * Processes extra participants and applies toggle logic
 * @param participants - Current participants array (Discord Users)
 * @param extraUsers - Extra participant users to toggle
 * @returns Updated participants array
 * @example
 * // [user1, user2] + [user3, user1] = [user2, user3]
 * applyExtraParticipants(list, extraList);
 */
export function applyExtraParticipants(participants: User[], extraUsers: User[]): User[] {
    let result = [...participants];
    for (const user of extraUsers) {
        result = toggleParticipant(result, user);
    }
    return result;
}

/**
 * Processes extra participants from interaction options
 * @param participants - Current participants array (Discord Users)
 * @param interaction - Chat input interaction with extra participant options
 * @returns Updated participants array
 */
export function processExtraParticipantsFromInteraction(
    participants: User[],
    interaction: ChatInputCommandInteraction,
): User[] {
    const extraUsers = extractExtraParticipants(interaction);
    return applyExtraParticipants(participants, extraUsers);
}

/**
 * Separates participants into passing and failing groups
 * @param participants - All participants (Discord Users)
 * @param failedUserIds - Set of Discord IDs of failed participants
 * @returns Object with passed and failed participant arrays
 */
export function separatePassedAndFailed(
    participants: User[],
    failedUserIds: Set<string>,
): { passed: User[]; failed: User[] } {
    const passed: User[] = [];
    const failed: User[] = [];

    for (const user of participants) {
        if (failedUserIds.has(user.id)) {
            failed.push(user);
        }
        else {
            passed.push(user);
        }
    }

    return { passed, failed };
}

/**
 * Extracts failed participants from interaction options
 * @param interaction - Chat input interaction with failed participant options
 * @returns Set of Discord IDs of failed participants
 */
export function extractFailedParticipants(interaction: ChatInputCommandInteraction): Set<string> {
    const failedIds = new Set<string>();
    for (let i = 1; i <= 5; i++) {
        const user = interaction.options.getUser(`failedparticipant${i}`);
        if (user) {
            failedIds.add(user.id);
        }
    }
    return failedIds;
}
