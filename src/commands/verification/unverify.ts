import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, MessageFlags } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import robloxVerificationService from '../../features/robloxVerificationService';

class UnverifyCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('un-verify')
        .setDescription('Remove your Roblox verification and unlink your account.') as SlashCommandBuilder;

    public global = false;

    public isEphemeral(): boolean {
        return true;
    }

    public async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            const discordId = interaction.user.id;
            const isVerified = await robloxVerificationService.isVerified(discordId);

            if (!isVerified) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder()
                    .setContent('❌ You are not verified yet. Run `/verify` to verify your account.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    components: [container],
                });
                return;
            }

            // Remove verification
            const removed = await robloxVerificationService.removeVerification(discordId);
            if (!removed) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder()
                    .setContent('❌ Failed to remove verification. Please try again.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    components: [container],
                });
                return;
            }

            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder()
                .setContent('✅ **Verification Removed**\n\nYour Roblox account has been unlinked from your Discord account.\n\nRun `/verify` again to re-link.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });

            console.info(`Verification removed for user ${interaction.user.tag} (${discordId})`);
        }
        catch (error) {
            console.error('Error in unverify command:', error);
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder()
                .setContent('❌ An error occurred. Please try again.');
            container.addTextDisplayComponents(content);
            try {
                await interaction.editReply({
                    components: [container],
                });
            }
            catch (e) {
                console.error('Failed to send error reply:', e);
            }
        }
    }
}

export default UnverifyCommand;
