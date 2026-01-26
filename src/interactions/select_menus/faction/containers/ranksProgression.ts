import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} from 'discord.js';

export const buildRanksProgressionContainer = () => {
    const container = new ContainerBuilder().setAccentColor(0x3498DB);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📈 Ranks & Progression'),
    );

    container.addSeparatorComponents(
        new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**Status:** *Temporary placeholder*
**Overview:** Rank ladder, requirements, and points will be explained here.
**Next:** Guidance and criteria coming soon.`,
        ),
    );

    return container;
};
