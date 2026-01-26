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
            '├ <@&1454231103425613874> **Overseer** — *Can’t be obtained*\n' +
            '├ <@&1454232393451048960> **Leader of the Armed Forces, Operational Head** — *Appointed by the Prime Executive*\n' +
            '├ <@&1454246002667159713> **Commanding General for Expeditionary Command** — *Appointed by the Marshal*\n' +
            '└ <@&1454246064671690772> **Expeditionary Branch Element Heads** — *Appointed by the General*\n\n' +
            '**🪖 Officer Corps**\n' +
            '├ <@&1454246615362830469> **Division Leader** — *Promoted by merit only*\n' +
            '├ <@&1454247249117843497> **Senior Officer** — *Promoted by merit only*\n' +
            '├ <@&1454247316436418794> **Officer** — *Promoted by merit only*\n' +
            '├ <@&1454247524159324201> **Cadet** — *Pass cadet period*\n' +
            '└ <@&1454247629277106367> **Officer in Training** — *Pass application*\n\n' +
            '**🛡️ NCO Corps**\n' +
            '├ <@&1454247772164329676> **Senior Advisor to the General Officers, Head of the NCOs** — *Handpicked by General Officers*\n' +
            '├ <@&1454247839608602735> **NCO** — *TBD required points*\n' +
            '├ <@&1454247896697409690> **Senior NCO, Mentor to Junior Sergeants** — *TBD required points*\n' +
            '├ <@&1454247959834263643> **NCO** — *TBD required points*\n' +
            '├ <@&1454248031024320674> **NCO** — *TBD required points*\n' +
            '└ <@&1454248110845857954> **First Real NCO Rank** — *Pass JSG period*\n\n' +
            '**🪖 Enlisted Corps**\n' +
            '├ <@&1454248351724736654> **Final Enlisted Rank** — *TBD required points*\n' +
            '├ <@&1454248409463656511> **Senior Grade Enlisted** — *TBD required points*\n' +
            '├ <@&1454248467282006078> **Enlisted** — *TBD required points*\n' +
            '├ <@&1454248608307351664> **Enlisted** — *TBD required points*\n' +
            '├ <@&1454248722891407472> **First Enlisted Rank** — *Pass basic training*\n' +
            '└ <@&1454248763915898971> **Trooper in Training Rank** — *Pass application*',
        ),
    );

    return container;
};
