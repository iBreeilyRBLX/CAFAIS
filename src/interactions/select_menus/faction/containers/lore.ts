import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} from 'discord.js';

export const buildLoreContainer = () => {
    const container = new ContainerBuilder().setAccentColor(0x9B59B6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📖 Lore'),
    );

    container.addSeparatorComponents(
        new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**Status:** *Temporary placeholder*
**Overview:** Faction history and story content will be summarized here.
**Next:** Lore entries coming soon.`,
        ),
    );

    return container;
};
