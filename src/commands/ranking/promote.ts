import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MessageFlags, GuildMember } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { canPromoteToRank } from '../../ranks/permissions';
import { promoteUser, getRankByPrefix, getNextRank } from '../../features/rankingManager';
import { PromotionStatus } from '../../types/ranking';
import { ranks } from '../../ranks/ranks';

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
        )
        .addBooleanOption(option =>
            option.setName('bypass_requirements')
                .setDescription('Bypass cooldown and points requirements (HICOM only)')
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
            const bypassRequirements = interaction.options.getBoolean('bypass_requirements') || false;
            const targetMember = await interaction.guild?.members.fetch(targetUser.id);

            if (!targetMember) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                const content = new TextDisplayBuilder().setContent('## ❌ Error\n\nCould not fetch member data. Please try again.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Find user's current rank by checking their roles against the ranks array
            const currentRank = ranks.find(rank => targetMember.roles.cache.has(rank.discordRoleId));

            if (!currentRank) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                const content = new TextDisplayBuilder().setContent('## ❌ Error\n\n**Issue:** User has no rank assigned.\n**Action:** Please assign a rank first.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Get next rank
            const nextRankPrefix = getNextRank(currentRank.prefix);
            if (!nextRankPrefix) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                const content = new TextDisplayBuilder().setContent('## ❌ Cannot Promote\n\n**Reason:** User is already at maximum rank.\n**Current Rank:** ' + currentRank.name);
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
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                const content = new TextDisplayBuilder().setContent(
                    `## 🚫 Insufficient Authority\n\n**Reason:**\n${promotionCheck.reason}`,
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
                fromRank: currentRank.prefix as any,
                executorId: interaction.user.id,
                executorUsername: interaction.user.username,
                reason,
                bypassCooldown: bypassRequirements,
                bypassPoints: bypassRequirements,
            });

            // Handle result
            if (result.success) {
                const container = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);
                const content = new TextDisplayBuilder().setContent(
                    '## ✅ Promotion Successful\n\n' +
                    `**User:** ${targetUser.username}\n` +
                    `**From:** ${currentRank.name}\n` +
                    `**To:** ${getRankByPrefix(nextRankPrefix)?.name}\n\n` +
                    `**Reason:** *${reason}*`,
                );
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
            }
            else {
                // Handle various failure cases
                let errorMessage = '## ❌ Promotion Failed\n\n';
                switch (result.status) {
                case PromotionStatus.COOLDOWN_ACTIVE: {
                    const hours = result.cooldownRemaining ? Math.ceil(result.cooldownRemaining / (1000 * 60 * 60)) : 0;
                    errorMessage += `**⏰ Cooldown Active**\nUser must wait **${hours} hours** before promotion.`;
                    break;
                }
                case PromotionStatus.INSUFFICIENT_POINTS:
                    errorMessage += `**⭐ Insufficient Points**\nUser needs **${result.pointsNeeded} more points** for eligibility.`;
                    break;
                case PromotionStatus.RANK_LOCKED:
                    errorMessage += `**🔒 Rank Locked**\nUser is locked at rank **${result.fromRank}**.`;
                    break;
                case PromotionStatus.ROLE_ERROR:
                    errorMessage += `**⚠️ Role Update Failed**\n${result.message}`;
                    break;
                case PromotionStatus.DATABASE_ERROR:
                    errorMessage += `**💾 Database Error**\n${result.message}`;
                    break;
                default:
                    errorMessage += `**Error:** ${result.message || 'An unknown error occurred.'}`;
                }

                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
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
            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            const content = new TextDisplayBuilder().setContent('## ❌ Unexpected Error\n\n**Issue:** An unexpected error occurred.\n**Action:** Please try again or contact an administrator.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
    }
}

export default new PromoteCommand();