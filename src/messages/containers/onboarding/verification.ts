import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';

/**
 * Message ID 1: Onboarding Verification
 * Displays verification requirements and process for new members
 */
export const buildVerificationContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0x3498DB);

    const title = new TextDisplayBuilder()
        .setContent('## Onboarding Verification');

    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const description = new TextDisplayBuilder()
        .setContent(
            'In order to gain access to the Applications Center to apply to become an Trooper of the Cascadian Armed Forces [CASF], you\'ll need to verify your accounts.\n\n' +
            '**How to Verify:**\n' +
            'Click the "Verify Now" button below.\n\n' +
            '**After Verification, you\'ll gain access to:**\n' +
            '• **Application Center** - Apply to get into the faction.\n\n' +
            'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
            '**Welcome to the Cascadian Armed Forces.**',
        );
    container.addTextDisplayComponents(description);

    const separator2 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator2);

    const buttonRow1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('startVerification')
                .setLabel('Verify Now')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔐'),
        );
    container.addActionRowComponents(buttonRow1);

    return container;
};
