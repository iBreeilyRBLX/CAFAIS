import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Message ID 10: Tryout Notifications
 * Template and guidelines for tryout notifications
 */
export const buildTryoutNotificationsContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0x8e44ad);

    const title = new TextDisplayBuilder()
        .setContent('## 🏆 Tryout Notifications');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const description = new TextDisplayBuilder()
        .setContent(
            'Use this channel to notify troops of upcoming tryouts, provide essential details, and confirm participation. Copy/paste the template and fill every line.\n\n' +
            '**⚠️ Notice:** Some tryouts may require specific ranks or certifications. Verify eligibility before confirming participation.\n\n' +
            '## 📝 Tryout Notification Template (Copy/Paste)\n' +
            '```\n' +
            '# TRYOUT NAME HERE\n' +
            '\n' +
            '[HOST]\n' +
            '[CO-HOST] (If Any)\n' +
            '\n' +
            '[BRANCH] (Put the branch that is hosting the tryout)\n' +
            '[TRYOUT DETAILS]\n' +
            '[TRYOUT REQUIREMENTS]\n' +
            '\n' +
            '[VOICE CHANNEL] <#ChannelID>\n' +
            '[RADIO FREQUENCY] #000\n' +
            '[SQUAD COLOR]\n' +
            '[EVENT LINK]\n' +
            '\n' +
            '[SERVER CODE]\n' +
            '```',
        );
    container.addTextDisplayComponents(description);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Hammertime')
                .setStyle(ButtonStyle.Link)
                .setURL('https://hammertime.cyou/')
                .setEmoji('⏱️'),
        );
    container.addActionRowComponents(buttonRow);

    return container;
};
