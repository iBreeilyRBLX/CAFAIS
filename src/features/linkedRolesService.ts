import { GuildMember, Role } from 'discord.js';
import { linkedRoleSets, isChildRole } from '../config/linkedRoles';

/**
 * Service to manage linked roles
 * Automatically grants/removes parent roles based on child role assignments
 */
class LinkedRolesService {
    /**
     * Check and update linked roles for a member
     * Call this whenever a member's roles change
     */
    public async updateLinkedRoles(member: GuildMember): Promise<{ added: Role[], removed: Role[] }> {
        const added: Role[] = [];
        const removed: Role[] = [];

        for (const roleSet of linkedRoleSets) {
            // const freshMember = await member.guild.members.fetch({ user: member.id, force: true });
            const hasAnyChildRole = roleSet.childRoleIds.some(childId =>
                member.roles.cache.has(childId),
            );

            const hasParentRole = member.roles.cache.has(roleSet.parentRoleId);

            // If they have any child role but not the parent, add the parent
            if (hasAnyChildRole && !hasParentRole) {
                try {
                    const role = await member.guild.roles.fetch(roleSet.parentRoleId);
                    if (role) {
                        await member.roles.add(role, `Linked role: has child role(s) in ${roleSet.parentRoleName}`);
                        added.push(role);
                        console.log(`Granted ${roleSet.parentRoleName} to ${member.user.username}`, 'LinkedRoles');
                    }
                }
                catch (error) {
                    console.error(`Failed to add parent role ${roleSet.parentRoleName}`, error, 'LinkedRoles');
                }
            }

            // If they don't have any child role but have the parent, remove the parent
            if (!hasAnyChildRole && hasParentRole) {
                try {
                    const role = await member.guild.roles.fetch(roleSet.parentRoleId);
                    if (role) {
                        await member.roles.remove(role, `Linked role: no longer has any child roles in ${roleSet.parentRoleName}`);
                        removed.push(role);
                        console.info(`Removed ${roleSet.parentRoleName} from ${member.user.username}`, 'LinkedRoles');
                    }
                }
                catch (error) {
                    console.error(`Failed to remove parent role ${roleSet.parentRoleName}`, error, 'LinkedRoles');
                }
            }
        }

        return { added, removed };
    }

    /**
     * Sync linked roles for all members in a guild
     * Use this for initial setup or manual audits
     */
    public async syncAllMembers(members: GuildMember[]): Promise<{
        processed: number;
        rolesAdded: number;
        rolesRemoved: number;
        errors: number;
    }> {
        let processed = 0;
        let rolesAdded = 0;
        let rolesRemoved = 0;
        let errors = 0;

        console.log(`Starting sync for ${members.length} members...`, 'LinkedRoles');

        for (const member of members) {
            try {
                const result = await this.updateLinkedRoles(member);
                rolesAdded += result.added.length;
                rolesRemoved += result.removed.length;
                processed++;

                // Progress logging every 50 members
                if (processed % 50 === 0) {
                    console.debug(`Progress: ${processed}/${members.length} members processed`, 'LinkedRoles');
                }

                // Rate limit protection: 1 second delay every 10 members
                if (processed % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            catch (error: any) {
                // If error is DiscordAPIError[50013] (Missing Permissions), skip and continue
                if (error && (error.code === 50013 || (error.rawError && error.rawError.code === 50013))) {
                    console.warn(`Skipped member ${member.user?.username || member.id} due to missing permissions (50013).`);
                    continue;
                }
                errors++;
                console.error(`Error processing ${member.user?.username || member.id}`, error, 'LinkedRoles');
            }
        }

        console.log(`Sync complete: ${processed} processed, ${rolesAdded} added, ${rolesRemoved} removed, ${errors} errors`, 'LinkedRoles');

        return { processed, rolesAdded, rolesRemoved, errors };
    }

    /**
     * Check if a role change should trigger linked role updates
     */
    public shouldTriggerUpdate(roleId: string): boolean {
        return isChildRole(roleId);
    }

    /**
     * Get information about what linked roles a member qualifies for
     */
    public getMemberLinkedRoleStatus(member: GuildMember): Array<{
        parentRoleName: string;
        parentRoleId: string;
        hasParentRole: boolean;
        qualifyingChildRoles: string[];
        shouldHaveParentRole: boolean;
    }> {
        return linkedRoleSets.map(roleSet => {
            const qualifyingChildRoles = roleSet.childRoleIds.filter(childId =>
                member.roles.cache.has(childId),
            );

            const hasParentRole = member.roles.cache.has(roleSet.parentRoleId);
            const shouldHaveParentRole = qualifyingChildRoles.length > 0;

            return {
                parentRoleName: roleSet.parentRoleName,
                parentRoleId: roleSet.parentRoleId,
                hasParentRole,
                qualifyingChildRoles,
                shouldHaveParentRole,
            };
        });
    }
}

export default new LinkedRolesService();
