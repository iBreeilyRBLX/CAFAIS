import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} from 'discord.js';

export const buildBranchesDivisionsContainer = () => {
    const container = new ContainerBuilder().setAccentColor(0x9B59B6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 🎖️ Branches & Divisions'),
    );

    container.addSeparatorComponents(
        new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**Status:** *Temporary placeholder*
**Overview:** Branch roles and division specialties will be documented here.
**Next:** Full breakdown coming soon.`,
        ),
    );

    return container;
};
