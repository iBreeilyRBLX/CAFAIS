import { Events, GuildMember } from 'discord.js';
import { Event } from '../../interfaces';
import ExtendedClient from '../../classes/Client';
import { ranks } from '../../ranks/ranks';
const event: Event = {
    name: Events.GuildMemberUpdate,
    execute: async (client: ExtendedClient, member: GuildMember) => {
        // make it so that when a member gets a rank role, their nickname is updated to include the rank prefix but if they have a previous rank prefix it will update that one instead of just adding on a new one. prefix format: [PREFIX] Username
        try {
            // Fetch fresh member data from API to get the latest roles
            await new Promise(resolve => setTimeout(resolve, 500));

            const freshMember = await member.guild.members.fetch({ user: member.id, force: true });
            const memberRoles = freshMember.roles.cache;
            const rankRole = ranks.find((rank) => memberRoles.has(rank.discordRoleId));

            const prefixRegex = /^\[(\w+)\]\s*/;
            const currentNickname = member.nickname || member.user.username;

            // Remove old prefix if it exists
            let username = currentNickname.replace(prefixRegex, '');

            // Create nickname with new rank prefix, or just username if no rank
            let newNickname = rankRole ? `[${rankRole.prefix}] ${username}` : username;

            // Ensure nickname doesn't exceed Discord's 32 character limit
            if (newNickname.length > 32) {
                // Recalculate with truncated username
                const maxUsernameLength = 32 - (rankRole ? rankRole.prefix.length + 3 : 0); // account for "[PREFIX] "
                username = username.slice(0, Math.max(1, maxUsernameLength - 3)) + '...';
                newNickname = rankRole ? `[${rankRole.prefix}] ${username}` : username;
            }

            // Only update if nickname actually changed
            if (newNickname !== currentNickname) {
                await member.setNickname(newNickname, 'Updated nickname to include rank prefix');
            }
        }
        catch (error) {
            console.error('Failed to update member nickname with rank prefix', error);
        }
    },
};

export default event;
