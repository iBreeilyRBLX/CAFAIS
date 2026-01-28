import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { CUSTOM_EMOJIS } from '../../../config/emojis';

/**
 * Message ID 2: Application Center
 * Provides information about the application process and requirements
 */
export const buildApplicationContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0x57F287);

    const title = new TextDisplayBuilder()
        .setContent('## Application Center');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const description = new TextDisplayBuilder()
        .setContent(
            '**Ready to join the Cascadian Armed Forces [CASF]?**\n\n' +
            'This is where your journey begins! Follow these steps to submit your application.\n\n' +
            '## Application Steps:\n' +
            `**1.** Send a join request to the **${CUSTOM_EMOJIS.roblox.default} Roblox Group**\n` +
            '**2.** Click **"Start Application"** below\n' +
            '**3.** Complete the application form\n' +
            '**4.** Wait for review by our team\n\n' +
            '## Important Notes:\n' +
            `• Ensure your ${CUSTOM_EMOJIS.roblox.default} Roblox account is verified\n` +
            '• Answer all questions honestly\n' +
            '• Applications are reviewed within 24-48 hours\n\n' +
            '_Questions? Contact <@&1454232274273959957>+ personnel for assistance._',
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
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('Roblox Group')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.roblox.com/communities/11590462/Cascadian-Armed-Forces-CASF#!/about')
                .setEmoji('🎮'),
        );
    container.addActionRowComponents(buttonRow1);

    return container;
};
