import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

/**
 * Message ID 8: Event Polls
 * Template and guidelines for deployment event polls
 */
export const buildEventPollsContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0xF39C12);

    const title = new TextDisplayBuilder()
        .setContent('## 📢 Event Polls');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const description = new TextDisplayBuilder()
        .setContent(
            'Use this channel to notify troops of a deployment, the time it will occur, and to confirm attendance. Copy/paste the template and fill every line.\n\n' +
            '**⚠️ Notice:** Some events require specific ranks. Verify eligibility before affirming attendance.\n\n' +
            '## 📝 Event Poll Template (Copy/Paste)\n' +
            '```\n' +
            '# EVENT NAME HERE\n' +
            '\n' +
            '[HOST]\n' +
            '[CO-HOST] (If Any)\n' +
            '\n' +
            '[STRICTNESS]\n' +
            '[EVENT DETAILS]\n' +
            '[MINIMUM ATTENDANCE]\n' +
            '[RANK REQUIRED]\n' +
            '[EVENT LINK]\n' +
            '\n' +
            '[NOTES]\n' +
            '<@&1454533624379605096>\n' +
            '```',
        );
    container.addTextDisplayComponents(description);


    return container;
};
