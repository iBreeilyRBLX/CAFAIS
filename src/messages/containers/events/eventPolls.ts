import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

/**
 * Message ID 7: Event Polls
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
            '**⚠️ Notice:** Some events require specific ranks or certifications. Verify eligibility before affirming attendance.\n\n' +
            '## 📝 Deployment Template (Copy/Paste)\n' +
            '```\n' +
            '[DEPLOYMENT CATEGORY]: Combat Patrol | Roleplay | Story\n' +
            '\n' +
            '[MISSION IMPORTANCE]: Low | Medium | High | Critical\n' +
            '[DEPLOYMENT LEAD]: (@Mention)\n' +
            '[OPERATION]: Operation Name\n' +
            '[EVENT TIME]:(USE HAMMERTIME)\n' +
            '[MINIMUM ATTENDANCE]: #\n' +
            '[DEPLOYMENT DETAILS]: Brief overvieinw + objectives\n' +
            '[REQUIRED RANK/CERTS]: None / List here\n' +
            '[SPECIFICATIONS]: PTS WILL BE ENABLED.\n' +
            '```\n\n' +
            '⏱️ **Hammertime:** https://hammertime.cyou/',
        );
    container.addTextDisplayComponents(description);

    return container;
};
