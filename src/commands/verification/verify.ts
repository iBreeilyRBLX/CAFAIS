import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

import robloxVerificationService from '../../features/robloxVerificationService';
import { ranks } from '../../ranks/ranks';


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
            const container = new ContainerBuilder();
            const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nAn error occurred. Please try again.');
            container.addTextDisplayComponents(content);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        }
    }

    private async updateUserVerification(client: ExtendedClient, interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
        const isVerified = await robloxVerificationService.isVerified(userId);
        if (isVerified) {
            const member = await interaction.guild?.members.fetch(userId);
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
            const robloxUser = await robloxVerificationService.getVerifiedUser(userId);
            if (!robloxUser) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent('# ❌ Error\n\nCould not retrieve verification data.');
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }
            const newNickname = robloxUser.displayName;
            if (newNickname.length > 32) {
                const container = new ContainerBuilder();
                const content = new TextDisplayBuilder().setContent(`# ❌ Nickname Too Long\n\n"${newNickname}" exceeds Discord's 32 character limit.`);
                container.addTextDisplayComponents(content);
                await interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                });
                return;
            }
            try {
                await member.setNickname(newNickname);
            }
            catch (e) {
                // ignore nickname errors
            }
            // Add verified role and remove unverified role, and add Initiate if no rank
            const verifiedRoleId = process.env.VERIFIED_ROLE_ID || '1454533624379605096'; // fallback to provided ID
            const unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID;
            const initiateRoleId = ranks.find(r => r.name === 'Initiate')?.discordRoleId;
            // All rank role IDs except Initiate
            const rankRoleIds = ranks.filter(r => r.name !== 'Initiate').map(r => r.discordRoleId);
            try {
                // Remove unverified role if present
                if (unverifiedRoleId && member.roles.cache.has(unverifiedRoleId)) {
                    await member.roles.remove(unverifiedRoleId);
                }
                // Add verified role if not present
                if (verifiedRoleId && !member.roles.cache.has(verifiedRoleId)) {
                    await member.roles.add(verifiedRoleId);
                }
                // Only give Initiate role if user has no rank roles (excluding Initiate)
                const hasRank = ranks.some(rank => rank.name !== 'Initiate' && member.roles.cache.has(rank.discordRoleId));
                if (!hasRank && initiateRoleId && !member.roles.cache.has(initiateRoleId)) {
                    await member.roles.add(initiateRoleId);
                }
            }
            catch (e) {
                // ignore role errors
            }
            const container = new ContainerBuilder();
            const title = new TextDisplayBuilder().setContent('# ✅ Verification Updated');
            container.addTextDisplayComponents(title);
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            const successMessage = `**Your Discord nickname has been updated!**\n\n**New Nickname**\n${newNickname}\n\n**Roblox Account**\n${robloxUser.displayName} (@${robloxUser.name})`;
            const content = new TextDisplayBuilder().setContent(successMessage);
            container.addTextDisplayComponents(content);
            container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
            const footer = new TextDisplayBuilder().setContent('*Always Forward, Never Turning Back*');
            container.addTextDisplayComponents(footer);
            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
            return;
        }
        // Not verified - initiate OAuth flow
        const userTag = (await interaction.client.users.fetch(userId)).tag;
        const authData = await robloxVerificationService.generateAuthorizationUrl(userId, userTag);
        const discordOAuthUrl = robloxVerificationService.generateDiscordAuthUrl(authData.stateToken);
        const container = new ContainerBuilder();
        const title = new TextDisplayBuilder().setContent('# 🔐 Dual OAuth Verification');
        container.addTextDisplayComponents(title);
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
        const intro = new TextDisplayBuilder().setContent('To verify your account, you need to authenticate with **both Discord and Roblox** OAuth.\n\nThis ensures you own both accounts and links them securely.');
        container.addTextDisplayComponents(intro);
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: false }));
        const steps = new TextDisplayBuilder().setContent('**Step 1️⃣ Discord OAuth**\nVerify you own this Discord account\n\n**Step 2️⃣ Roblox OAuth**\nLink your Roblox profile and display name\n\n**Step 3️⃣ Done!**\nYour Discord nickname will automatically update to your Roblox display name.');
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

export default VerifyCommand;
