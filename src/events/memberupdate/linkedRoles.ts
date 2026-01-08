import { Events, GuildMember } from 'discord.js';
import { Event } from '../../interfaces';
import ExtendedClient from '../../classes/Client';
import linkedRolesService from '../../features/linkedRolesService';

/**
 * Event handler for when a member's roles are updated
 * Automatically manages linked roles based on role changes
 */
const event: Event = {
    name: Events.GuildMemberUpdate,
    execute: async (client: ExtendedClient, oldMember: GuildMember, newMember: GuildMember) => {
        try {
            // Force fetch the latest member data to ensure accuracy
            const updatedMember = await newMember.guild.members.fetch({ user: newMember.id, force: true });

            // Check if roles actually changed
            const oldRoleIds = oldMember.roles.cache.map(r => r.id).sort();
            const newRoleIds = updatedMember.roles.cache.map(r => r.id).sort();

            if (oldRoleIds.join(',') === newRoleIds.join(',')) {
                return;
            }

            const addedRoles = newRoleIds.filter(id => !oldRoleIds.includes(id));
            const removedRoles = oldRoleIds.filter(id => !newRoleIds.includes(id));

            const shouldUpdate = [...addedRoles, ...removedRoles].some(roleId =>
                linkedRolesService.shouldTriggerUpdate(roleId),
            );

            if (!shouldUpdate) {
                return;
            }

            const result = await linkedRolesService.updateLinkedRoles(updatedMember);

            if (result.added.length > 0 || result.removed.length > 0) {
                console.debug(
                    `[LinkedRoles] Updated roles for ${updatedMember.user.username}: ` +
                `+${result.added.length} -${result.removed.length}`,
                );
            }
        }
        catch (error) {
            console.error('[LinkedRoles] Error in guildMemberUpdate event:', error);
        }
    },
};

export default event;
