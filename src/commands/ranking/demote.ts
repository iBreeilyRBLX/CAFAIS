import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MessageFlags, GuildMember } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import { ranks } from '../../ranks/ranks';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';
import { canPromoteToRank } from '../../ranks/permissions';
import configJSON from '../../config.json';
import prisma from '../../database/prisma';

const DEMOTION_LOG_CHANNEL_ID = configJSON.channels.promotionLogs;

type DemotionLogDetails = {
    executorId: string;
    executorTag: string; // username, not deprecated tag
    promotedId: string;
    promotedTag: string; // username, not deprecated tag
    fromRank: string;
    toRank: string;
    reason: string;
    timestamp?: number;
};

class DemoteCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('demote')
        .setDescription('demote a user to the previous rank (Officers and above only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to demote')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for demotion')
                .setRequired(false),
        ) as SlashCommandBuilder;

    public global = false;

    public isEphemeral(): boolean {
        return true;
    }

    protected async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            if (!(await checkAndReplyPerms(interaction, 'demote'))) {
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

            const nextRank = ranks[currentRankIndex + 1];

            // Check if executor can promote to this rank
            const demotionCheck = canPromoteToRank(interaction.member as GuildMember, nextRank.prefix);
            if (!demotionCheck.canPromote) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent(
                    `# ❌ Insufficient Demotion Authority\n\n${demotionCheck.reason}`,
                );
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Perform demotion in transaction
            // 1. Remove cooldown from old rank
            await prisma.rankCooldown.deleteMany({
                where: {
                    userDiscordId: targetUser.id,
                    rank: currentRank.prefix,
                },
            });

            // 2. Remove current rank and add next rank
            await member.roles.remove(currentRank.discordRoleId);
            await member.roles.add(nextRank.discordRoleId);

            // 3. Update user's nickname with new rank
            const newNickname = `[${nextRank.prefix}] ${member.user.username}`;
            try {
                await member.setNickname(newNickname);
            }
            catch (error) {
                console.warn(`Could not update nickname for ${targetUser.id}`);
            }

            await this.logDemotion(client, {
                executorId: interaction.user.id,
                executorTag: interaction.user.username,
                promotedId: targetUser.id,
                promotedTag: targetUser.username,
                fromRank: currentRank.name,
                toRank: nextRank.name,
                reason,
            });

            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder().setContent(
                `# ✅ Demotion Successful\n\n${targetUser.username} has been demoted from **${currentRank.name}** to **${nextRank.name}**.`,
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

    private buildDemotionLogContainer(details: DemotionLogDetails): ContainerBuilder {
        const container = new ContainerBuilder();
        const timestamp = details.timestamp ?? Math.floor(Date.now() / 1000);

        const title = new TextDisplayBuilder().setContent('# Demotion Log');
        container.addTextDisplayComponents(title);

        const body = new TextDisplayBuilder().setContent(
            '**Demoted User:** <@' + details.promotedId + '> (' + details.promotedTag + ')\n' +
            '**From:** ' + details.fromRank + '\n' +
            '**To:** ' + details.toRank + '\n' +
            '**By:** <@' + details.executorId + '> (' + details.executorTag + ')\n' +
            '**Reason:** ' + details.reason + '\n' +
            '**Time:** <t:' + timestamp + ':F>',
        );
        container.addTextDisplayComponents(body);

        return container;
    }

    private async logDemotion(client: ExtendedClient, details: DemotionLogDetails): Promise<void> {
        try {
            const channel = await client.channels.fetch(DEMOTION_LOG_CHANNEL_ID);

            if (!channel || !channel.isTextBased() || !channel.isSendable()) {
                console.warn(`Demotion log channel ${DEMOTION_LOG_CHANNEL_ID} not found or not text based`);
                return;
            }

            const logContainer = this.buildDemotionLogContainer({
                ...details,
                timestamp: Math.floor(Date.now() / 1000),
            });

            await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [logContainer],
            });
        }
        catch (error) {
            console.error('Error logging demotion:', error);
        }
    }
}

export default new DemoteCommand();