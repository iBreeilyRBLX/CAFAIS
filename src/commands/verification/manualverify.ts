import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder, MessageFlags, GuildMember } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import robloxVerificationService from '../../features/robloxVerificationService';
import { checkAndReplyPerms } from '../../ranks/permissionCheck';

class ManualVerifyCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('manualverify')
        .setDescription('Manually verify a user by linking their Discord and Roblox accounts')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The Discord user to verify')
                .setRequired(true),
        )
        .addStringOption(option =>
            option
                .setName('roblox_id')
                .setDescription('The user\'s Roblox ID (numbers only)')
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder;

    public global = false;

    public isEphemeral(): boolean {
        return true;
    }

    public async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        // Check permissions using the rank system
        const member = interaction.member as GuildMember;
        if (!member) {
            await interaction.editReply({ content: 'Unable to verify your permissions.' });
            return;
        }

        const hasPermission = await checkAndReplyPerms(interaction, 'manualverify');
        if (!hasPermission) {
            return;
        }

        try {
            const targetUser = interaction.options.getUser('user', true);
            const robloxIdString = interaction.options.getString('roblox_id', true);
            const discordId = targetUser.id;

            // Validate Roblox ID format
            const robloxId = parseInt(robloxIdString, 10);
            if (isNaN(robloxId) || robloxId <= 0) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder()
                    .setContent('❌ Invalid Roblox ID. Please provide a valid numeric Roblox ID.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Check if user is already verified
            const isAlreadyVerified = await robloxVerificationService.isVerified(discordId);
            if (isAlreadyVerified) {
                const existingUser = await robloxVerificationService.getVerifiedUser(discordId);
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder()
                    .setContent(
                        '⚠️ **User Already Verified**\n\n' +
                        `${targetUser.tag} is already verified as:\n` +
                        `**${existingUser?.displayName}** (@${existingUser?.name})\n` +
                        `Roblox ID: \`${existingUser?.id}\`\n\n` +
                        'Use `/un-verify` on them first to re-verify.',
                    );
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Fetch Roblox user data
            const robloxUser = await robloxVerificationService.getRobloxUserById(robloxId);
            if (!robloxUser) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder()
                    .setContent(`❌ Could not find Roblox user with ID \`${robloxId}\`. Please verify the ID is correct.`);
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Complete verification using the service (roles will be updated automatically)
            const result = await robloxVerificationService.completeVerification(
                discordId,
                robloxUser,
                interaction.guild || undefined,
            );

            if (!result.success) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder()
                    .setContent(result.message);
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Send success message
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder()
                .setContent(
                    '✅ **Manual Verification Complete**\n\n' +
                    `**Discord User:** ${targetUser.tag} (\`${targetUser.id}\`)\n` +
                    `**Roblox Account:** ${robloxUser.displayName} (@${robloxUser.name})\n` +
                    `**Roblox ID:** \`${robloxUser.id}\`\n\n` +
                    'The user has been successfully verified and roles have been updated.',
                );
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });

            // Try to DM the user
            try {
                const dmContainer = new ContainerBuilder();
                const dmContent = new TextDisplayBuilder()
                    .setContent(
                        '✅ **You Have Been Verified**\n\n' +
                        `You have been manually verified in **${interaction.guild?.name}**!\n\n` +
                        `**Linked Roblox Account:** ${robloxUser.displayName} (@${robloxUser.name})\n\n` +
                        'You now have access to the server. Welcome aboard!',
                    );
                dmContainer.addTextDisplayComponents(dmContent);
                await targetUser.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [dmContainer],
                });
            }
            catch (dmError) {
                console.log('[MANUALVERIFY] Could not DM user about verification');
            }
        }
        catch (error) {
            console.error('[MANUALVERIFY] Error in manual verify command:', error);
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder()
                .setContent('❌ An error occurred while processing manual verification. Please try again.');
            container.addTextDisplayComponents(content);
            try {
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
            }
            catch (e) {
                console.error('[MANUALVERIFY] Failed to send error message:', e);
            }
        }
    }
}

export default new ManualVerifyCommand;
