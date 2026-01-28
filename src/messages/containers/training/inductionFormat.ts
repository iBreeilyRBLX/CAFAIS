import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

/**
 * Message ID 4: Induction Request Format
 * Training request format and guidelines for initiates
 */
export const buildInductionFormatContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0xF39C12);

    const title = new TextDisplayBuilder()
        .setContent('## ⚒️ Induction Request Format');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const welcome = new TextDisplayBuilder()
        .setContent(
            'Hello Initiates, welcome to the Cascadian Academy. Here you will be trained by our Training Officers, who will show you the means to be a true Cascadian.',
        );
    container.addTextDisplayComponents(welcome);

    const separator2 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator2);

    const rules = new TextDisplayBuilder()
        .setContent(
            '## Training Rules\n' +
            '**__To participate in training you will have to follow the following rules:__**\n\n' +
            '1. You will use a Carbines / Assault Rifles or Battle Rifles.\n' +
            '2. You will follow all orders given by the trainer.\n' +
            '3. You won\'t spawn any vehicle if the trainer didn\'t give you permission.\n' +
            '4. You will follow the trainer unless instructed otherwise.',
        );
    container.addTextDisplayComponents(rules);

    const separator3 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator3);

    const instructions = new TextDisplayBuilder()
        .setContent(
            '## How to Request Training\n\n' +
            'If you want to be trained request one in <#1454556030988980446>.\n' +
            'When a Training Officer sees the request he will post a poll in <#1454555912491761875>.\n' +
            'When it is time for the training, it will be announced in <#1454555800822611968>.',
        );
    container.addTextDisplayComponents(instructions);

    const separator4 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator4);

    const format = new TextDisplayBuilder()
        .setContent(
            '## Request Format\n' +
            '```\n' +
            'Username: Your username in the discord server\n' +
            'Time: (Use hammer time and copy the day/month/year/hour) EX: <t:1767524460:F>\n' +
            'Time Frame: (Time from the requested time you expect to be available)\n' +
            'Ping: <@&1454538513981767774>\n' +
            '```',
        );
    container.addTextDisplayComponents(format);

    const separator5 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator5);

    const hammertime = new TextDisplayBuilder()
        .setContent(
            '## Get Your Time\n' +
            '**[HAMMERTIME](https://hammertime.cyou/)**\n\n' +
            'Use this tool to generate your timestamp.',
        );
    container.addTextDisplayComponents(hammertime);

    const separator6 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator6);

    const support = new TextDisplayBuilder()
        .setContent(
            'If you have any questions, ping a Training Officer in <#1454556114237784145>',
        );
    container.addTextDisplayComponents(support);

    return container;
};
