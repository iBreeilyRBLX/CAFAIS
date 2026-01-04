import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';

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
                'In order to gain access to the Applications Center to apply to become an Trooper of the Cascadian Armed Forces [CASF], you\'ll need to verify your accounts.\n\n' +
                '**How to Verify:**\n' +
                'Click the "Verify Now" button below.\n\n' +
                '**After Verification, you\'ll gain access to:**\n' +
                '⁍ **Application Center** - Apply to get into the faction.\n\n' +
                'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
                '**Welcome to the Cascadian Armed Forces.**',
            );
        container.addTextDisplayComponents(description);

        // const description1 = new TextDisplayBuilder()
        //     .setContent(
        //         '⁍ **Application Center** - Apply to get into the faction.\n\n' +
        //         'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
        //         '**Welcome to the Cascadian Armed Forces.**',
        //     );
        // container.addTextDisplayComponents(description1);
        // container.addSectionComponents((section) =>
        //     section
        //         .setButtonAccessory((button) =>
        //             button.setCustomId('startVerification').setLabel('Verify Now').setStyle(ButtonStyle.Primary).setEmoji({ name: '✅' }),
        //         )
        //         .addTextDisplayComponents(
        //             (textDisplay) => textDisplay.setContent(
        //                 '**After Verification, you\'ll gain access to:**\n' +
        //                 '⁍ **Application Center** - Apply to get into the faction.\n\n' +
        //                 'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
        //                 '**Welcome to the Cascadian Armed Forces.**',
        //             ),
        //         ),
        // );
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
                    .setEmoji('✅'),
            );
        container.addActionRowComponents(buttonRow1);

        return container;
    },
    2: () => {
        const container = new ContainerBuilder();

        const title = new TextDisplayBuilder()
            .setContent('# Application Center');
        container.addTextDisplayComponents(title);
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        const description = new TextDisplayBuilder()
            .setContent(
                'Welcome to the Application Center! Here, you can apply to become a Trooper in the Cascadian Armed Forces [CASF].\n\n' +
                '**How to Apply:**\n' +
                'First pend to the group so you can be accepted in.\n' +
                'Click the "Start Application" button below to begin your application process.\n\n' +
                'If you need assistance, feel free to reach out to <@&1454232274273959957>+ personnel.\n\n' +
                '**We look forward to reviewing your application!**',
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
                    .setCustomId('startApplication')
                    .setLabel('Start Application')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),
            );
        container.addActionRowComponents(buttonRow1);

        return container;
    },
};
