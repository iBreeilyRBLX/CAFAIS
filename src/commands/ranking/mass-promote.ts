import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    GuildMember,
} from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { ranks } from '../../ranks/ranks';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { canPromoteToRank } from '../../ranks/permissions';
import { logPromotion } from '../../features/discordLogger';
import { PromotionLogData } from '../../types/ranking';

/**
 * Mass Promote Command
 * Promotes multiple users at once to their next rank
 * Automatically batches promotion logs via the logging system
 */
class MassPromoteCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('mass-promote')
        .setDescription('Promote multiple users to their next rank (Officers and above only)')
        .addStringOption(option =>
            option.setName('users')
                .setDescription('User mentions or IDs separated by spaces (e.g., @user1 @user2 @user3)')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for promotions')
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

            const usersInput = interaction.options.getString('users', true);
            const reason = interaction.options.getString('reason') || 'Mass promotion';

            // Parse user IDs from mentions or raw IDs
            const userIds = this.parseUserIds(usersInput);

            if (userIds.length === 0) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent(
                    '# ❌ Error\n\nNo valid users found. Please mention users or provide their IDs separated by spaces.',
                );
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            if (userIds.length > 50) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent(
                    '# ❌ Error\n\nToo many users. Maximum is 50 users per command.',
                );
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Process promotions
            const results = await this.processPromotions(
                client,
                interaction,
                userIds,
                reason,
            );

            // Send results
            await this.sendResults(interaction, results);
        }
        catch (error) {
            console.error('Error in /mass-promote command:', error);
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder().setContent(
                '# ❌ Error\n\nAn error occurred during mass promotion. Please try again.',
            );
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
    }

    /**
     * Parse user IDs from input string (handles mentions and raw IDs)
     */
    private parseUserIds(input: string): string[] {
        const mentionRegex = /<@!?(\d+)>/g;
        const idRegex = /\d{17,19}/g;

        const ids = new Set<string>();

        // Extract from mentions
        let match;
        while ((match = mentionRegex.exec(input)) !== null) {
            ids.add(match[1]);
        }

        // Extract raw IDs
        while ((match = idRegex.exec(input)) !== null) {
            ids.add(match[0]);
        }

        return Array.from(ids);
    }

    /**
     * Process promotions for all users
     */
    private async processPromotions(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction,
        userIds: string[],
        reason: string,
    ): Promise<PromotionResult[]> {
        const results: PromotionResult[] = [];

        for (const userId of userIds) {
            const result = await this.promoteUser(
                client,
                interaction,
                userId,
                reason,
            );
            results.push(result);
        }

        return results;
    }

    /**
     * Promote a single user
     */
    private async promoteUser(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction,
        userId: string,
        reason: string,
    ): Promise<PromotionResult> {
        try {
            // Fetch member
            const member = await interaction.guild?.members.fetch(userId).catch(() => null);

            if (!member) {
                return {
                    userId,
                    success: false,
                    error: 'Member not found',
                };
            }

            // Find current rank
            const currentRank = ranks.find(rank => member.roles.cache.has(rank.discordRoleId));

            if (!currentRank) {
                return {
                    userId,
                    member,
                    success: false,
                    error: 'No rank found',
                };
            }

            // Find current rank index
            const currentRankIndex = ranks.findIndex(rank => rank.discordRoleId === currentRank.discordRoleId);

            // Check if at max rank
            if (currentRankIndex === 0) {
                return {
                    userId,
                    member,
                    currentRank: currentRank.name,
                    success: false,
                    error: 'Already at maximum rank',
                };
            }

            const nextRank = ranks[currentRankIndex - 1];

            // Check if executor can promote to this rank
            const promotionCheck = canPromoteToRank(
                interaction.member as GuildMember,
                nextRank.prefix,
            );
            if (!promotionCheck.canPromote) {
                return {
                    userId,
                    member,
                    currentRank: currentRank.name,
                    targetRank: nextRank.name,
                    success: false,
                    error: promotionCheck.reason || 'Insufficient promotion authority',
                };
            }

            // Remove current rank and add next rank
            await member.roles.remove(currentRank.discordRoleId);
            await member.roles.add(nextRank.discordRoleId);

            // Update nickname with new rank
            const newNickname = `[${nextRank.prefix}] ${member.user.username}`;
            try {
                await member.setNickname(newNickname);
            }
            catch (error) {
                console.warn(`Could not update nickname for ${userId}`);
            }

            // Log promotion (batched automatically)
            const logData: PromotionLogData = {
                userId: member.user.id,
                username: member.user.username,
                userTag: member.user.tag,
                fromRank: currentRank.name,
                toRank: nextRank.name,
                executorId: interaction.user.id,
                executorUsername: interaction.user.username,
                reason,
                timestamp: new Date(),
            };

            logPromotion(client, logData);

            return {
                userId,
                member,
                currentRank: currentRank.name,
                newRank: nextRank.name,
                success: true,
            };
        }
        catch (error) {
            console.error(`Error promoting user ${userId}:`, error);
            return {
                userId,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Send results to the interaction
     */
    private async sendResults(
        interaction: ChatInputCommandInteraction,
        results: PromotionResult[],
    ): Promise<void> {
        const container = new ContainerBuilder();

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        // Title
        const title = new TextDisplayBuilder().setContent(
            `# 📊 Mass Promotion Results\n\n**Total:** ${results.length} | **Success:** ${successful.length} | **Failed:** ${failed.length}`,
        );
        container.addTextDisplayComponents(title);

        // Successful promotions
        if (successful.length > 0) {
            const separator1 = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            container.addSeparatorComponents(separator1);

            // Group by rank transition
            const groupedByTransition = new Map<string, PromotionResult[]>();
            for (const result of successful) {
                const key = `${result.currentRank} → ${result.newRank}`;
                if (!groupedByTransition.has(key)) {
                    groupedByTransition.set(key, []);
                }
                const group = groupedByTransition.get(key);
                if (group) {
                    group.push(result);
                }
            }

            let successContent = '## Successful Promotions\n\n';
            for (const [transition, users] of groupedByTransition.entries()) {
                successContent += `**${transition}** (${users.length})\n`;
                for (const user of users) {
                    successContent += `• <@${user.userId}>\n`;
                }
                successContent += '\n';
            }

            const successText = new TextDisplayBuilder().setContent(successContent.trim());
            container.addTextDisplayComponents(successText);
        }

        // Failed promotions
        if (failed.length > 0) {
            const separator2 = new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            });
            container.addSeparatorComponents(separator2);

            let failContent = '## ❌ Failed Promotions\n\n';
            for (const result of failed) {
                const userDisplay = result.member ? `<@${result.userId}>` : `User ID: ${result.userId}`;
                failContent += `• ${userDisplay} - ${result.error}\n`;
            }

            const failText = new TextDisplayBuilder().setContent(failContent.trim());
            container.addTextDisplayComponents(failText);
        }

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
        });
    }
}

/**
 * Individual promotion result for mass promotion
 */
interface PromotionResult {
    userId: string;
    member?: GuildMember;
    currentRank?: string;
    newRank?: string;
    /** For failed promotions where we tried to promote to a specific rank */
    targetRank?: string;
    success: boolean;
    error?: string;
}

export default new MassPromoteCommand();
