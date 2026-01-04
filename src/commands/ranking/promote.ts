import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MessageFlags } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import prisma from '../../database/prisma';
import { ranks } from '../../ranks/ranks';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';

// filepath: /home/admin/cafais/src/commands/ranking/promote.ts

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

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            if (!(await checkAndReplyPerms(interaction, 'promote'))) {
                return;
            }

            const targetUser = interaction.options.getUser('user', true);
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
}

export default new PromoteCommand();