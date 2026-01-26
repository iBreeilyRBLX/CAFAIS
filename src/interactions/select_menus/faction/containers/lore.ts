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
            `**Lore:** The Cascadian Armed Forces are the standing military of the Cascadian Federation, a nation set on the completely fictional world of Arcadia.

**Origins:** The Federation was founded after a Great War shook Arcadia and Cascadia split from a dying empire. Now Cascadia stands as a beacon of strength amid Arcadia’s chaos. Nestled in the mountains with its capital, Columbia, high above the valleys, life is tough—but it forges resilient, strong citizens.

**Your Role:** You are a Cascadian citizen who becomes a Trooper within the CASF’s Expeditionary Command, charged with fighting Cascadia’s foreign conflicts to protect national security interests. Your service will shape how the lore evolves and how Cascadia meets the challenges ahead.

**The Fight Ahead:** You will be thrown into the newest conflicts that rock Arcadia and, alongside your fellow Troopers, show the might of the Federation and come out stronger.

**Remember:** Cascadia Stands Strong.`,
        ),
    );

    return container;
};
