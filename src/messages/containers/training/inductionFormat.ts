import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryBuilder } from 'discord.js';

/**
 * Message ID 4: Induction Request Format
 * Training request format and guidelines for initiates
 */

export function buildInductionFormatContainers() {
    // --- Main Info Container (video now at the bottom) ---
    const container = new ContainerBuilder()
        .setAccentColor(0x3498DB);

    // Induction Request Format Section
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## ⚒️ Induction Request Format'),
    );
    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

    // Welcome (no greeting repeat)
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            'Welcome to the Cascadian Academy. Here you will be trained by our Training Officers, who will show you the means to be a true Cascadian.',
        ),
    );
    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

    // Training Rules
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '## Training Rules\n' +
            '**__To participate in training you will have to follow the following rules:__**\n\n' +
            '1. You will use a Carbines / Assault Rifles or Battle Rifles.\n' +
            '2. You will follow all orders given by the trainer.\n' +
            '3. You won\'t spawn any vehicle if the trainer didn\'t give you permission.\n' +
            '4. You will follow the trainer unless instructed otherwise.',
        ),
    );
    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

    // How to Request Training
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '## How to Request Training\n\n' +
            'If you want to be trained request one in <#1454556030988980446>.\n' +
            'When a Training Officer sees the request he will post a poll in <#1454555912491761875>.\n' +
            'When it is time for the training, it will be announced in <#1454555800822611968>.',
        ),
    );
    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

    // Request Format
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '## Request Format\n' +
            '```\n' +
            'Username: Your username in the discord server\n' +
            'Time: (Use hammer time and copy the day/month/year/hour) EX: <t:1767524460:F>\n' +
            'Time Frame: (Time from the requested time you expect to be available)\n' +
            'Ping: <@&1454538513981767774>\n' +
            '```',
        ),
    );
    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

    // Hammertime
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '## Get Your Time\n' +
            '**[HAMMERTIME](https://hammertime.cyou/)**\n\n' +
            'Use this tool to generate your timestamp.',
        ),
    );
    // Academy Relay/Joining Instructions (now above video)
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '## 🛡️ Joining Training\n' +
            'If you are having trouble joining an training follow the steps below. Here’s how to do it:\n' +
            '1. Click the bottom-most option on the left, titled **CUSTOM GAME** under the play tab.\n' +
            '2. When a training starts, copy the code posted in <#1454555800822611968>.\n' +
            '3. Paste the code into the textbox below **Join Server By Code**.\n' +
            '4. Click **Join**. When prompted, click **Yes** to launch the game and begin your training.\n\n' +
            'Cascadia Stands!',
        ),
    );
    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

    // Training Video Section (now at the very bottom)
    const gallery = new MediaGalleryBuilder();
    gallery.addItems(item => item.setURL('https://cdn.discordapp.com/attachments/1454555746489602129/1466040428674678844/Roblox-2026-01-28T23_54_38.294Z.mp4'));
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 🎬 Training Video'),
    );
    container.addMediaGalleryComponents(gallery);
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('_If you have trouble joining, watch this video for a step-by-step guide!_'),
    );

    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));

    // Support
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            'If you have any questions, ping a Training Officer in <#1454556114237784145>',
        ),
    );
    container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));


    // Return single container in array for compatibility
    return container;
}
