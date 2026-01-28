import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

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
            '**⚠️ Notice:** Some events may require specific ranks or certifications. Verify eligibility before confirming participation.\n\n' +
            '## 📝 Event Notification Template (Copy/Paste)\n' +
            '```\n' +
            '[EVENT TYPE]: Training | Briefing | Ceremony | Other\n' +
            '\n' +
            '[EVENT NAME]: Name of Event\n' +
            '[EVENT LEAD]: (@Mention)\n' +
            '[EVENT TIME]:(USE HAMMERTIME)\n' +
            '[LOCATION]: Where the event will be held\n' +
            '[EVENT DETAILS]: Brief overview + objectives\n' +
            '[REQUIRED RANK/CERTS]: None / List here\n' +
            '[NOTES]: Any additional information\n' +
            '```\n\n' +
            '⏱️ **Hammertime:** https://hammertime.cyou/',
        );
    container.addTextDisplayComponents(description);

    return container;
};
