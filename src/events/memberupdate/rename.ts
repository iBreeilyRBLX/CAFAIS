import { Events, GuildMember } from 'discord.js';
import { Event } from '../../interfaces';
import ExtendedClient from '../../classes/Client';
import { ranks } from '../../ranks/ranks';
const event: Event = {
    name: Events.GuildMemberUpdate,
    execute: async (client: ExtendedClient, member: GuildMember) => {
        // When a member gets a rank role, update their nickname to include the rank prefix.
        // If they already have a prefix, replace it (do not stack).
        // Format: [PREFIX] Username
        try {
            // Fetch fresh member data from API to get the latest roles
            await new Promise(resolve => setTimeout(resolve, 500));

            const freshMember = await member.guild.members.fetch({ user: member.id, force: true });
            const memberRoles = freshMember.roles.cache;
            const rankRole = ranks.find((rank) => memberRoles.has(rank.discordRoleId));

            const prefixRegex = /^\[[^\]]+\]\s*/;
            const currentNickname = member.nickname || member.user.username;

            // Remove any old prefix if it exists
            let username = currentNickname.replace(prefixRegex, '');

            // If no rank role, revert to username (no prefix)
            let newNickname = username;
            if (rankRole) {
                newNickname = `[${rankRole.prefix}] ${username}`;
                // Ensure nickname doesn't exceed Discord's 32 character limit
                if (newNickname.length > 32) {
                    // Truncate username to fit
                    const maxUsernameLength = 32 - (rankRole.prefix.length + 3); // [PREFIX] + space
                    username = username.slice(0, Math.max(1, maxUsernameLength - 3)) + '...';
                    newNickname = `[${rankRole.prefix}] ${username}`;
                }
            }

            // Only update if nickname actually changed
            if (newNickname !== currentNickname) {
                await member.setNickname(newNickname, 'Updated nickname to include rank prefix');
            }
        }
        catch (error) {
            // If error is DiscordAPIError[50013] (Missing Permissions), just skip
            if (error && typeof error === 'object' && 'code' in error && error.code === 50013) {
                console.warn('Skipped nickname update due to missing permissions (50013)');
                return;
            }
            console.error('Failed to update member nickname with rank prefix', error);
        }
    },
};

export default event;
