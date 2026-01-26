import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} from 'discord.js';

export const buildSelectionNotFoundContainer = () => {
    const container = new ContainerBuilder().setAccentColor(0xE67E22);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## ⚠️ Selection Not Found'),
    );

    container.addSeparatorComponents(
        new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**Issue:** Unknown selection.
**Action:** Please choose an option from the menu again.`,
        ),
    );

    return container;
};
