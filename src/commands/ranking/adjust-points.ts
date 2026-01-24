/**
 * @fileoverview Adjust Points Command - Manually adjust user points (HICOM only)
 * @module commands/ranking/adjust-points
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MessageFlags, PermissionsBitField } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import prisma from '../../database/prisma';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';

class AdjustPointsCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('adjust-points')
        .setDescription('Manually adjust user points (HICOM only)')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to adjust points for')
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount to add (positive) or subtract (negative)')
                .setRequired(true)
                .setMinValue(-500)
                .setMaxValue(500),
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for adjustment')
                .setRequired(true)
                .setMaxLength(200),
        ) as SlashCommandBuilder;

    public global = false;

    public isEphemeral(): boolean {
        return false;
    }

    protected async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        // Check HICOM permissions
        if (!(await checkAndReplyPerms(interaction, 'adjust-points'))) {
            return;
        }

        const targetUser = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);
        const reason = interaction.options.getString('reason', true);

        try {
            // Update user profile points
            const updatedProfile = await prisma.userProfile.upsert({
                where: { discordId: targetUser.id },
                update: {
                    points: { increment: amount },
                },
                create: {
                    discordId: targetUser.id,
                    username: targetUser.username,
                    discriminator: targetUser.discriminator ?? '0',
                    points: Math.max(0, amount), // Ensure non-negative
                },
            });

            const container = new ContainerBuilder()
                .setAccentColor(0x3498DB);
            const title = new TextDisplayBuilder().setContent('## ✅ Points Adjusted Successfully');
            container.addTextDisplayComponents(title);

            const details = new TextDisplayBuilder().setContent(
                `**👤 User:** ${targetUser.username}\n` +
                `**🔄 Adjustment:** ${amount > 0 ? '+' : ''}${amount} points\n` +
                `**⭐ New Total:** ${updatedProfile.points} points\n` +
                `**📝 Reason:** *${reason}*\n` +
                `**👤 Adjusted by:** ${interaction.user.username}`,
            );
            container.addTextDisplayComponents(details);

            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
        catch (error) {
            console.error('[adjust-points] Error adjusting points:', error);
            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            const content = new TextDisplayBuilder().setContent('## ❌ Error\n\n**Issue:** Failed to adjust points.\n**Action:** Please try again or contact support.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
    }
}

export default new AdjustPointsCommand();
