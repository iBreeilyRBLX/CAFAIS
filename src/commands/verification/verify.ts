import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';
import robloxVerificationService from '../../features/robloxVerificationService';
import { CUSTOM_EMOJIS } from '../../config/emojis';


class VerifyCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Link your Discord and Roblox accounts or update your nickname.') as SlashCommandBuilder;

    public global = false;

    public isEphemeral(): boolean {
        return true;
    }

    public async executeCommand(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            const commandUserId = interaction.user.id;
            await this.updateUserVerification(client, interaction, commandUserId);
        }
        catch (error) {
            // Log the error for debugging
            console.error('Error in /verify command:', error);
            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            const content = new TextDisplayBuilder().setContent('## ❌ Verification Error\n\n**Issue:** An error occurred during verification.\n**Action:** Please try again.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
    }

    private async updateUserVerification(client: ExtendedClient, interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
        // Ensure user profile exists in DB
        const user = await interaction.client.users.fetch(userId);
        const userProfile = await import('../../database/prisma');
        const prisma = userProfile.default;
        await prisma.userProfile.upsert({
            where: { discordId: userId },
            update: {},
            create: {
                discordId: userId,
                username: user.username,
                discriminator: user.discriminator ?? '0000',
            },
        });

        const isVerified = await robloxVerificationService.isVerified(userId);
        if (isVerified) {
            const member = await interaction.guild?.members.fetch(userId);
            if (!member) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                const content = new TextDisplayBuilder().setContent('## ❌ Error\n\n**Issue:** Could not fetch member data.\n**Action:** Please try again or contact support.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }
            const robloxUser = await robloxVerificationService.getVerifiedUser(userId);
            if (!robloxUser) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                const content = new TextDisplayBuilder().setContent('## ❌ Verification Error\n\n**Issue:** Could not retrieve verification data.\n**Action:** Please verify again.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }
            // Remove unverified role if present
            const unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID;
            if (unverifiedRoleId && member.roles.cache.has(unverifiedRoleId)) {
                try {
                    await member.roles.remove(unverifiedRoleId);
                }
                catch (e) {
                    // ignore role errors
                }
            }
            const newNickname = robloxUser.displayName;
            if (newNickname.length > 32) {
                const container = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                const content = new TextDisplayBuilder().setContent(`## ❌ Nickname Issue\n\n**Problem:** "${newNickname}" exceeds Discord's 32 character limit.\n**Action:** Please update your Roblox display name.`);
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
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
            const container = new ContainerBuilder();
            const title = new TextDisplayBuilder().setContent('# Verification Updated');
            container.addTextDisplayComponents(title);
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            let successMessage = `**Your Discord nickname has been updated!**\n\n**New Nickname**\n${newNickname}\n\n${CUSTOM_EMOJIS.roblox.default} **Roblox Account**\n${robloxUser.displayName} (@${robloxUser.name})`;
            if (nicknameUpdateFailed) {
                successMessage = `**Verification Status**\n\n${CUSTOM_EMOJIS.discord.default} Your Discord account is linked to:\n${CUSTOM_EMOJIS.roblox.default} **${robloxUser.displayName}** (@${robloxUser.name})\n\n**Nickname Update Failed:** ${nicknameError}`;
            }
            const content = new TextDisplayBuilder().setContent(successMessage);
            container.addTextDisplayComponents(content);
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
            return;
        }
        // Not verified - initiate OAuth flow
        const userTag = user.tag;
        const authData = await robloxVerificationService.generateAuthorizationUrl(userId, userTag);
        const discordOAuthUrl = robloxVerificationService.generateDiscordAuthUrl(authData.stateToken);
        const container = new ContainerBuilder();
        const title = new TextDisplayBuilder().setContent('# Dual OAuth Verification');
        container.addTextDisplayComponents(title);
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
        const intro = new TextDisplayBuilder().setContent(`To verify your account, you need to authenticate with **both ${CUSTOM_EMOJIS.discord.default} Discord and ${CUSTOM_EMOJIS.roblox.default} Roblox** OAuth.\n\nThis ensures you own both accounts and links them securely.`);
        container.addTextDisplayComponents(intro);
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: false }));
        const steps = new TextDisplayBuilder().setContent(`**Step 1️⃣ ${CUSTOM_EMOJIS.discord.default} Discord OAuth**\nVerify you own this Discord account\n\n**Step 2️⃣ ${CUSTOM_EMOJIS.roblox.default} Roblox OAuth**\nLink your Roblox profile and display name\n\n**Step 3️⃣ Done!**\nYour Discord nickname will automatically update to your Roblox display name.`);
        container.addTextDisplayComponents(steps);
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
        const footer = new TextDisplayBuilder().setContent('Click the button below to start the verification process.');
        container.addTextDisplayComponents(footer);
        const verifyButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Start Verification')
                    .setStyle(ButtonStyle.Link)
                    .setURL(discordOAuthUrl),
            );
        container.addActionRowComponents(verifyButton);
        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
        });
    }
}

export default new VerifyCommand();
