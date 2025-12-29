import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { Button } from '../../../interfaces';
import robloxVerificationService from '../../../features/robloxVerificationService';

const button: Button = {
    name: 'startVerification',
    execute: async (_client, interaction) => {
        try {
            const userId = interaction.user.id;
            const isVerified = await robloxVerificationService.isVerified(userId);

            if (isVerified) {
                // User already verified
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder()
                    .setContent('# ✅ Already Verified\n\nYou are already verified! Your account is linked.');
                container.addTextDisplayComponents(content);
                await interaction.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                    ephemeral: true,
                });
                return;
            }

            // Not verified - initiate OAuth flow
            const userTag = interaction.user.tag;
            const authData = await robloxVerificationService.generateAuthorizationUrl(userId, userTag);
            const discordOAuthUrl = robloxVerificationService.generateDiscordAuthUrl(authData.stateToken);

            const container = new ContainerBuilder();

            const title = new TextDisplayBuilder()
                .setContent('# 🔐 Dual OAuth Verification');
            container.addTextDisplayComponents(title);

            container.addSeparatorComponents(new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            }));

            const intro = new TextDisplayBuilder()
                .setContent('To verify your account, you need to authenticate with **both Discord and Roblox** OAuth.\n\nThis ensures you own both accounts and links them securely.');
            container.addTextDisplayComponents(intro);

            container.addSeparatorComponents(new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: false,
            }));

            const steps = new TextDisplayBuilder()
                .setContent('**Step 1️⃣ Discord OAuth**\nVerify you own this Discord account\n\n**Step 2️⃣ Roblox OAuth**\nLink your Roblox profile and display name\n\n**Step 3️⃣ Done!**\nYour Discord nickname will automatically update to your Roblox display name (with your rank if you have one!)');
            container.addTextDisplayComponents(steps);

            container.addSeparatorComponents(new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            }));

            const footer = new TextDisplayBuilder()
                .setContent('Click the button below to start the verification process.');
            container.addTextDisplayComponents(footer);

            // Add verification button
            const verifyButton = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Start Verification')
                        .setStyle(ButtonStyle.Link)
                        .setURL(discordOAuthUrl),
                );
            container.addActionRowComponents(verifyButton);

            await interaction.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
                ephemeral: true,
            });
        }
        catch (error) {
            console.error('Error in startVerification button:', error);
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder()
                .setContent('# ❌ Error\n\nAn error occurred while starting verification. Please try again.');
            container.addTextDisplayComponents(content);
            await interaction.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
                ephemeral: true,
            });
        }
    },
};

export default button;
