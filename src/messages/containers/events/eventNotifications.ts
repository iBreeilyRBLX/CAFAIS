import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Message ID 9: Event Notifications
 * Template and guidelines for event notifications
 */
export const buildEventNotificationsContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0x2980D9);

    const title = new TextDisplayBuilder()
        .setContent('## 📣 Event Notifications');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const description = new TextDisplayBuilder()
        .setContent(
            'Use this channel to notify troops of upcoming events, provide essential details, and confirm participation. Copy/paste the template and fill every line.\n\n' +
            '**⚠️ Notice:** Some events may require specific ranks. Verify eligibility before confirming participation.\n\n' +
            '## 📝 Event Notification Template (Copy/Paste)\n' +
            '```\n' +
            '# EVENT NAME HERE\n' +
            '\n' +
            '[HOST]\n' +
            '[CO-HOST] (If Any)\n' +
            '\n' +
            '[EVENT DETAILS]\n' +
            '[SQUAD COLOR]\n' +
            '[RADIO FREQUENCY] #000\n' +
            '[EVENT LINK]\n' +
            '\n' +
            '[SERVER CODE]\n' +
            '<@&1454533624379605096>\n' +
            '```',
        );
    container.addTextDisplayComponents(description);

    return container;
};
