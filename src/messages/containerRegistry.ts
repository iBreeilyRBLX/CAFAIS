import { ContainerBuilder, MediaGalleryBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Central registry mapping message IDs to their container builders
 * Add new messages here with their corresponding ID from index.json
 */
export const containerRegistry: Record<number, () => ContainerBuilder> = {
    // Message ID 1: Onboarding Verification
    1: () => {
        const container = new ContainerBuilder();

        const title = new TextDisplayBuilder()
            .setContent('# Onboarding Verification');
        container.addTextDisplayComponents(title);

        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        const description = new TextDisplayBuilder()
            .setContent(
                'In order to gain access to the Applications Center to apply to become an Operative of Cascadian Armed Forces [CASF], you\'ll need to verify your accounts.\n\n' +
                '**How to Verify:**\n' +
                'Click the "Verify Now" button below.\n\n' +
                '**After Verification, you\'ll gain access to:**\n' +
                '⁍ **Application Center** - Apply to get into the faction.\n\n' +
                'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
                '**Welcome to the Cascadian Armed Forces.**',
            );
        container.addTextDisplayComponents(description);

        const separator2 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator2);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('startVerification')
                    .setLabel('Verify Now')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✅'),
            );
        container.addActionRowComponents(buttonRow);

        return container;
    },

    // Add more message builders here as needed
    // Example:
    // 6: () => { ... },
};
