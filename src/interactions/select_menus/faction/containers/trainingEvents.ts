import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} from 'discord.js';

export const buildTrainingEventsContainer = () => {
    const container = new ContainerBuilder().setAccentColor(0x3498DB);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 🎯 Training & Events'),
    );

    container.addSeparatorComponents(
        new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }),
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**Status:** *Temporary placeholder*
**Overview:** Training formats, schedules, and expectations will be listed here.
**Next:** Full schedule and rules coming soon.`,
        ),
    );

    return container;
};
