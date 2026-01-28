import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

/**
 * Message ID 8: Training Announcements
 * Format for Training Officers to announce when training has started
 */
export const buildTrainingAnnouncementsContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0xE67E22);

    const title = new TextDisplayBuilder()
        .setContent('## ⚔️ Training Announcements');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const description = new TextDisplayBuilder()
        .setContent(
            'This channel is used by Training Officers to announce that training has started.\n\n' +
            '**📢 Purpose:** Notify initiates when to join the training session.',
        );
    container.addTextDisplayComponents(description);

    const separator2 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator2);

    const format = new TextDisplayBuilder()
        .setContent(
            '## 📋 Announcement Format\n' +
            '```\n' +
            '[Induction Training]\n\n' +
            'Host: Host Name\n' +
            'Voice Channel: #voice-channel-name\n' +
            'Squad Colour: Blue\n' +
            'Server Code: ba9dc4c8-e66b-4343-ba81-3411626e19b6\n' +
            'Notes: [Any additional information]\n\n' +
            '@Initiate\n' +
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
            '**[Induction Training]**\n\n' +
            '**Host:** <@471739867332739092>\n' +
            '**Voice Channel:** <#1454556850782474345>\n' +
            '**Squad Colour:** Blue\n' +
            '**Server Code:** `ba9dc4c8-e66b-4343-ba81-3411626e19b6`\n' +
            '**Notes:** Please have your loadout ready before joining.\n\n' +
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
            '**📚 Resources:**\n' +
            '• Review training format in <#1454555758695022859>\n' +
            '• Training document: [View Here](https://docs.google.com/document/d/16Xb03qIZy_eYVmW5_Z88jSKyPTyNleA8LrzZLBzEpas/edit?usp=sharing)',
        );
    container.addTextDisplayComponents(footer);

    return container;
};
