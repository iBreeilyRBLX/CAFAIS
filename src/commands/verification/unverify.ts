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
                    flags: MessageFlags.IsComponentsV2,
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
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }

            // Update roles after successful verification removal
            const UNVERIFIED_ROLE_ID = process.env.UNVERIFIED_ROLE_ID || '1454581366233628733';
            const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID || '1454961614284656894';
            
            // Silence verbose logs; keep only errors
            
            if (!interaction.guild) {
                console.error('[UNVERIFY] No guild available in interaction');
            }
            else {
                try {
                    const member = await interaction.guild.members.fetch(discordId);
                    // Member fetched
                    
                    await member.roles.remove(VERIFIED_ROLE_ID);
                    // Verified role removed
                    
                    await member.roles.add(UNVERIFIED_ROLE_ID);
                    // Unverified role added
                    
                    // Roles updated
                }
                catch (roleError) {
                    console.error('[UNVERIFY] Failed to update roles during unverification:', roleError);
                    // Continue even if role update fails
                }
            }

            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder()
                .setContent('✅ **Verification Removed**\n\nYour Roblox account has been unlinked from your Discord account.\n\nRun `/verify` again to re-link.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });

            // Verification removed
        }
        catch (error) {
            console.error('Error in unverify command:', error);
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder()
                .setContent('❌ An error occurred. Please try again.');
            container.addTextDisplayComponents(content);
            try {
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
            }
            catch (e) {
                console.error('Failed to send error reply:', e);
            }
        }
    }
}

export default new UnverifyCommand();
