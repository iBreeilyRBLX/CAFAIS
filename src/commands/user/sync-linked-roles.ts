import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChatInputCommandInteraction, GuildMember, CacheType } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import linkedRolesService from '../../features/linkedRolesService';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';

class SyncLinkedRolesCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('sync-linked-roles')
        .setDescription('Synchronize linked roles for all members or a specific user')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Specific user to sync (leave empty to sync all members)')
                .setRequired(false),
        ) as SlashCommandBuilder;

    public global = false;

    public isEphemeral(): boolean {
        return false;
    }

    protected async executeCommand(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction,
        author: GuildMember,
    ): Promise<void> {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            // Sync single user
            await this.syncSingleUser(interaction, targetUser.id);
        }
        else {
            // Sync all members
            await this.syncAllMembers(interaction);
        }
    }

    private async syncSingleUser(interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
        if (!(await checkAndReplyPerms(interaction, 'sync-linked-roles'))) {
            return;
        }

        const member = await interaction.guild?.members.fetch(userId);

        if (!member) {
            await interaction.editReply('Could not find that member.');
            return;
        }

        const result = await linkedRolesService.updateLinkedRoles(member);

        const embed = new EmbedBuilder()
            .setTitle('✅ Linked Roles Synced')
            .setDescription(`Updated linked roles for ${member.user.username}`)
            .addFields(
                {
                    name: 'Roles Added',
                    value: result.added.length > 0
                        ? result.added.map(r => `• ${r.name}`).join('\n')
                        : 'None',
                    inline: true,
                },
                {
                    name: 'Roles Removed',
                    value: result.removed.length > 0
                        ? result.removed.map(r => `• ${r.name}`).join('\n')
                        : 'None',
                    inline: true,
                },
            )
            .setColor(result.added.length > 0 || result.removed.length > 0 ? '#28a745' : '#6c757d')
            .setTimestamp();

        // Add status info
        const status = linkedRolesService.getMemberLinkedRoleStatus(member);
        const statusText = status.map(s =>
            `**${s.parentRoleName}**: ${s.hasParentRole ? '✅' : '❌'} (${s.qualifyingChildRoles.length} qualifying role(s))`,
        ).join('\n');

        if (statusText) {
            embed.addFields({
                name: 'Current Status',
                value: statusText,
                inline: false,
            });
        }

        await interaction.editReply({ embeds: [embed] });
    }

    private async syncAllMembers(interaction: ChatInputCommandInteraction): Promise<void> {
        const startTime = Date.now();
        await interaction.editReply('⏳ Starting linked roles sync for all members... This may take a while.\n*Estimated time: ~2-3 minutes for 843 members*');

        const members = await interaction.guild?.members.fetch();

        if (!members) {
            await interaction.editReply('Failed to fetch guild members.');
            return;
        }

        const memberArray = Array.from(members.values()).filter(m => !m.user.bot);

        const result = await linkedRolesService.syncAllMembers(memberArray);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        // Simple completion message
        await interaction.editReply(
            '✅ **Linked Roles Sync Complete**\n\n' +
            `Processed: ${result.processed} members\n` +
            `Roles Added: ${result.rolesAdded}\n` +
            `Roles Removed: ${result.rolesRemoved}\n` +
            `Errors: ${result.errors}\n` +
            `Duration: ${duration}s`,
        );
    }
}

export default new SyncLinkedRolesCommand;