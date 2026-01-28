import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

/**
 * Message ID 6: Academy Polls
 * Information and format for Training Officers posting training polls
 */
export const buildAcademyPollsContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0xE67E22);

    const title = new TextDisplayBuilder()
        .setContent('## ⚔️ Training Polls');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const description = new TextDisplayBuilder()
        .setContent(
            'This channel is used by the Training Corps to communicate training times. As Initiates, simply react if you wish to attend the training at the given time.\n\n' +
            '**⚠️ Important:** Read through <#1454555758695022859> before attending.',
        );
    container.addTextDisplayComponents(description);

    const separator2 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator2);

    const format = new TextDisplayBuilder()
        .setContent(
            '## 📋 Poll Format\n' +
            '```\n' +
            '[HOST] @Username\n' +
            '[TRAINING TIME] (USE HAMMERTIME)\n' +
            '[NOTES] Please ensure to follow and read through <#1454555758695022859>\n\n' +
            'React if you\'re going to attend this training at the given time.\n\n' +
            '<@&1454248763915898971>\n' +
            '```',
        );
    container.addTextDisplayComponents(format);

    const separator3 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator3);

    const example = new TextDisplayBuilder()
        .setContent(
            '## 📝 Example\n' +
            '**[HOST]** <@471739867332739092>\n' +
            '**[TRAINING TIME]** <t:1767524460:F>\n' +
            '**[NOTES]** Please ensure to follow and read through <#1454555758695022859>\n\n' +
            'React if you\'re going to attend this training at the given time.\n\n' +
            '<@&1454248763915898971>',
        );
    container.addTextDisplayComponents(example);

    const separator4 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator4);

    const footer = new TextDisplayBuilder()
        .setContent(
            '⏱️ **Hammertime:** https://hammertime.cyou/',
        );
    container.addTextDisplayComponents(footer);

    return container;
};
