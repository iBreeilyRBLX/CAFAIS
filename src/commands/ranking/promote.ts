import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MessageFlags, GuildMember } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { canPromoteToRank } from '../../ranks/permissions';
import { promoteUser, getRankByPrefix, getNextRank } from '../../features/rankingManager';
import { PromotionStatus } from '../../types/ranking';

/**
 * @fileoverview Promote Command - Promotes users with centralized validation
 * @module commands/ranking/promote
 */

class PromoteCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promote a user to the next rank (Officers and above only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to promote')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for promotion')
                .setRequired(false),
        ) as SlashCommandBuilder;

    public global = false;

    public isEphemeral(): boolean {
        return true;
    }

    protected async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            if (!(await checkAndReplyPerms(interaction, 'promote'))) {
                return;
            }

            const targetUser = interaction.options.getUser('user', true);
            const reason = interaction.options.getString('reason') || 'Manual promotion';
            const targetMember = await interaction.guild?.members.fetch(targetUser.id);

            if (!targetMember) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nCould not fetch member data.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Find user's current rank
            const currentRankInfo = Array.from(targetMember.roles.cache.values())
                .map(role => getRankByPrefix(role.name.split(' ')[0]?.replace(/[\[\]]/g, '') || ''))
                .find(rank => rank !== undefined);

            if (!currentRankInfo) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nUser has no rank.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Get next rank
            const nextRankPrefix = getNextRank(currentRankInfo.prefix);
            if (!nextRankPrefix) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nUser is already at maximum rank.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Check if executor can promote to this rank
            const promotionCheck = canPromoteToRank(interaction.member as GuildMember, nextRankPrefix);
            if (!promotionCheck.canPromote) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent(
                    `# ❌ Insufficient Promotion Authority\n\n${promotionCheck.reason}`,
                );
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Use centralized promotion system with validation
            const result = await promoteUser(client, {
                targetMember,
                targetUser,
                toRank: nextRankPrefix as any, // Type assertion as rankingManager accepts string prefixes
                fromRank: currentRankInfo.prefix as any,
                executorId: interaction.user.id,
                executorUsername: interaction.user.username,
                reason,
                bypassCooldown: false,
                bypassPoints: false,
            });

            // Handle result
            if (result.success) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent(
                    `# ✅ Promotion Successful\n\n${targetUser.username} has been promoted from **${currentRankInfo.name}** to **${getRankByPrefix(nextRankPrefix)?.name}**.\n\n**Reason:** ${reason}`,
                );
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
            } else {
                // Handle various failure cases
                let errorMessage = '# ❌ Promotion Failed\n\n';
                switch (result.status) {
                    case PromotionStatus.COOLDOWN_ACTIVE:
                        const hours = result.cooldownRemaining ? Math.ceil(result.cooldownRemaining / (1000 * 60 * 60)) : 0;
                        errorMessage += `User is still on cooldown. **${hours} hours** remaining before they can be promoted.`;
                        break;
                    case PromotionStatus.INSUFFICIENT_POINTS:
                        errorMessage += `User needs **${result.pointsNeeded} more points** to be eligible for promotion.`;
                        break;
                    case PromotionStatus.RANK_LOCKED:
                        errorMessage += `User is locked at rank **${result.fromRank}** and cannot be promoted.`;
                        break;
                    case PromotionStatus.ROLE_ERROR:
                        errorMessage += `Failed to update Discord roles. ${result.message}`;
                        break;
                    case PromotionStatus.DATABASE_ERROR:
                        errorMessage += `Database error occurred. ${result.message}`;
                        break;
                    default:
                        errorMessage += result.message || 'An unknown error occurred.';
                }

                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent(errorMessage);
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
            }
        }
        catch (error) {
            console.error('[promote] Error in promote command:', error);
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nAn unexpected error occurred during promotion. Please try again.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
    }
}

export default new PromoteCommand();