import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MessageFlags, GuildMember } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { ranks } from '../../ranks/ranks';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { canPromoteToRank } from '../../ranks/permissions';

// filepath: /home/admin/cafais/src/commands/ranking/promote.ts

const PROMOTION_LOG_CHANNEL_ID = '1454639433566519306';

type PromotionLogDetails = {
    executorId: string;
    executorTag: string;
    promotedId: string;
    promotedTag: string;
    fromRank: string;
    toRank: string;
    reason: string;
    timestamp?: number;
};

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
            const reason = interaction.options.getString('reason') || 'No reason provided.';
            const member = await interaction.guild?.members.fetch(targetUser.id);

            if (!member) {
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
            const currentRank = ranks.find(rank => member.roles.cache.has(rank.discordRoleId));

            if (!currentRank) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nUser has no rank.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Find current rank index
            const currentRankIndex = ranks.findIndex(rank => rank.discordRoleId === currentRank.discordRoleId);

            // Check if user is at max rank
            if (currentRankIndex === 0) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nUser is already at maximum rank.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            const nextRank = ranks[currentRankIndex - 1];

            // Check if executor can promote to this rank
            const promotionCheck = canPromoteToRank(interaction.member as GuildMember, nextRank.prefix);
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

            // Remove current rank and add next rank
            await member.roles.remove(currentRank.discordRoleId);
            await member.roles.add(nextRank.discordRoleId);

            // Update user's nickname with new rank
            const newNickname = `[${nextRank.prefix}] ${member.user.username}`;
            try {
                await member.setNickname(newNickname);
            }
            catch (error) {
                console.warn(`Could not update nickname for ${targetUser.id}`);
            }

            await this.logPromotion(client, {
                executorId: interaction.user.id,
                executorTag: interaction.user.tag,
                promotedId: targetUser.id,
                promotedTag: targetUser.tag,
                fromRank: currentRank.name,
                toRank: nextRank.name,
                reason,
            });

            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder().setContent(
                `# ✅ Promotion Successful\n\n${targetUser.username} has been promoted from **${currentRank.name}** to **${nextRank.name}**.`,
            );
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
        catch (error) {
            console.error('Error in /promote command:', error);
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nAn error occurred during promotion. Please try again.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
    }

    private buildPromotionLogContainer(details: PromotionLogDetails): ContainerBuilder {
        const container = new ContainerBuilder();
        const timestamp = details.timestamp ?? Math.floor(Date.now() / 1000);

        const title = new TextDisplayBuilder().setContent('# Promotion Log');
        container.addTextDisplayComponents(title);

        const body = new TextDisplayBuilder().setContent(
            '**Promoted User:** <@' + details.promotedId + '> (' + details.promotedTag + ')\n' +
            '**From:** ' + details.fromRank + '\n' +
            '**To:** ' + details.toRank + '\n' +
            '**By:** <@' + details.executorId + '> (' + details.executorTag + ')\n' +
            '**Reason:** ' + details.reason + '\n' +
            '**Time:** <t:' + timestamp + ':F>',
        );
        container.addTextDisplayComponents(body);

        return container;
    }

    private async logPromotion(client: ExtendedClient, details: PromotionLogDetails): Promise<void> {
        try {
            const channel = await client.channels.fetch(PROMOTION_LOG_CHANNEL_ID);

            if (!channel || !channel.isTextBased() || !channel.isSendable()) {
                console.warn(`Promotion log channel ${PROMOTION_LOG_CHANNEL_ID} not found or not text based`);
                return;
            }

            const logContainer = this.buildPromotionLogContainer({
                ...details,
                timestamp: Math.floor(Date.now() / 1000),
            });

            await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [logContainer],
            });
        }
        catch (error) {
            console.error('Error logging promotion:', error);
        }
    }
}

export default new PromoteCommand();