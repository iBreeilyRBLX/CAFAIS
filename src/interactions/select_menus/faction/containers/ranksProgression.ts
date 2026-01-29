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
            '**🎖️ High Command & Leadership**\n' +
            '├ <@&1454231103425613874> **Prime Executive** — *Can’t be obtained*\n' +
            '├ <@&1454232393451048960> **Marshal** — *Appointed by the Prime Executive*\n' +
            '├ <@&1454246002667159713> **General** — *Appointed by the Marshal*\n' +
            '└ <@&1454246064671690772> **Lieutenant General** — *Appointed by the General*\n\n' +
            '**🪖 Officer Corps**\n' +
            '├ <@&1454246615362830469> **Commander** — *Promoted by merit only*\n' +
            '├ <@&1454247249117843497> **Captain** — *Promoted by merit only*\n' +
            '├ <@&1454247316436418794> **Lieutenant** — *Promoted by merit only*\n' +
            '├ <@&1454247524159324201> **Junior Lieutenant** — *Pass cadet period*\n' +
            '└ <@&1454247629277106367> **Officer in Training** — *Pass application*\n\n' +
            '**🛡️ NCO Corps**\n' +
            '├ <@&1454247772164329676> **Command Chief** — *Handpicked by General Officers*\n' +
            '├ <@&1454247839608602735> **Chief First Class** — *TBD required points*\n' +
            '├ <@&1454247896697409690> **Chief Second Class** — *TBD required points*\n' +
            '├ <@&1454247959834263643> **Superior Sergeant** — *TBD required points*\n' +
            '├ <@&1454248031024320674> **Senior Sergeant** — *TBD required points*\n' +
            '├ <@&1454248110845857954> **Sergeant** — *Pass JSG period*\n' +
            '└ <@&1454248188016988382> **Junior Sergeant** — *TBD required points*\n\n' +
            '**🪖 Enlisted Corps**\n' +
            '├ <@&1454248351724736654> **Corporal** — *Final Enlisted Rank, TBD required points*\n' +
            '├ <@&1454248409463656511> **Lance Corporal** — *Senior Grade Enlisted, TBD required points*\n' +
            '├ <@&1454248467282006078> **Superior Private** — *TBD required points*\n' +
            '├ <@&1454248608307351664> **Senior Private** — *TBD required points*\n' +
            '├ <@&1454248722891407472> **Private** — *First Enlisted Rank, pass basic training*\n' +
            '└ <@&1454248763915898971> **Initiate** — *Trooper in Training Rank, pass application*',
        ),
    );

    return container;
};
