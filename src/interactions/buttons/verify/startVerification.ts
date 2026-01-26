import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { Button } from '../../../interfaces';
import robloxVerificationService from '../../../features/robloxVerificationService';
import { ranks } from '../../../ranks/ranks';

const button: Button = {
    name: 'startVerification',
    execute: async (_client, interaction) => {
        try {
            const userId = interaction.user.id;
            const isVerified = await robloxVerificationService.isVerified(userId);

            if (isVerified) {
                const container = new ContainerBuilder();

                const member = await interaction.guild?.members.fetch(userId);
                if (!member) {
                    const content = new TextDisplayBuilder()
                        .setContent('# ❌ Error\n\nCould not find your member record in this server.');
                    container.addTextDisplayComponents(content);
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container],
                        ephemeral: true,
                    });
                    return;
                }

                const verifiedUser = await robloxVerificationService.getVerifiedUser(userId);
                if (!verifiedUser) {
                    const content = new TextDisplayBuilder()
                        .setContent('# ❌ Error\n\nVerification data not found. Please run /verify again.');
                    container.addTextDisplayComponents(content);
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container],
                        ephemeral: true,
                    });
                    return;
                }

                const latestRoblox = await robloxVerificationService.getRobloxUserById(verifiedUser.id);
                if (!latestRoblox) {
                    const content = new TextDisplayBuilder()
                        .setContent('# ❌ Error\n\nCould not fetch your latest Roblox profile. Please try again.');
                    container.addTextDisplayComponents(content);
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container],
                        ephemeral: true,
                    });
                    return;
                }

                const updateResult = await robloxVerificationService.completeVerification(userId, latestRoblox);
                if (!updateResult.success) {
                    const content = new TextDisplayBuilder()
                        .setContent('# ❌ Error\n\nCould not update your verification data. Please try again.');
                    container.addTextDisplayComponents(content);
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container],
                        ephemeral: true,
                    });
                    return;
                }

                let userRank = '';
                for (const rank of ranks) {
                    if (member.roles.cache.has(rank.discordRoleId)) {
                        userRank = rank.prefix;
                        break;
                    }
                }

                const newNickname = userRank
                    ? `[${userRank}] ${latestRoblox.displayName}`
                    : latestRoblox.displayName;

                if (newNickname.length > 32) {
                    const content = new TextDisplayBuilder()
                        .setContent(`## ❌ Nickname Issue\n\n**Problem:** "${newNickname}" exceeds Discord's 32 character limit.\n**Action:** Please update your Roblox display name.`);
                    container.addTextDisplayComponents(content);
                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container],
                        ephemeral: true,
                    });
                    return;
                }

                let nicknameUpdateFailed = false;
                let nicknameError = '';
                try {
                    await member.setNickname(newNickname);
                }
                catch (e: unknown) {
                    nicknameUpdateFailed = true;
                    if (e && typeof e === 'object' && 'code' in e) {
                        const error = e as { code: number; message?: string };
                        if (error.code === 50013) {
                            nicknameError = 'Missing Permissions - Bot cannot change your nickname (you may have a higher role)';
                        }
                        else if (error.code === 50035) {
                            nicknameError = 'Invalid nickname format';
                        }
                        else {
                            nicknameError = error.message || 'Unknown error';
                        }
                    }
                    else {
                        nicknameError = 'Could not update nickname';
                    }
                }

                const successMessage = nicknameUpdateFailed
                    ? `**Verification Updated**\n\nRoblox account refreshed to **${latestRoblox.displayName}** (@${latestRoblox.name}).\n\n**Nickname Update Failed:** ${nicknameError}`
                    : `**Verification Updated**\n\nYour Roblox display name is now **${latestRoblox.displayName}** (@${latestRoblox.name}).\n\n**New Nickname:** ${newNickname}`;

                const content = new TextDisplayBuilder().setContent(successMessage);
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
