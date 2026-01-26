import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} from 'discord.js';

export const buildDepartmentsContainer = () => {
    const container = new ContainerBuilder().setAccentColor(0x9B59B6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📋 Departments'),
    );

    container.addSeparatorComponents(
        new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**Status:** *Temporary placeholder*
**Overview:** Support and operations departments will be listed here.
**Next:** Details will be published soon.`,
        ),
    );

    return container;
};
