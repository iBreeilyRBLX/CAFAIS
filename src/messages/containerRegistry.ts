import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from 'discord.js';
import { CUSTOM_EMOJIS } from '../config/emojis';

/**
 * Central registry mapping message IDs to their container builders
 * Add new messages here with their corresponding ID from index.json
 */
export const containerRegistry: Record<number, () => ContainerBuilder> = {
    // Message ID 1: Onboarding Verification
    1: () => {
        const container = new ContainerBuilder()
            .setAccentColor(0x3498DB);

        const title = new TextDisplayBuilder()
            .setContent('## Onboarding Verification');

        container.addTextDisplayComponents(title);

        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        const description = new TextDisplayBuilder()
            .setContent(
                'In order to gain access to the Applications Center to apply to become an Trooper of the Cascadian Armed Forces [CASF], you\'ll need to verify your accounts.\n\n' +
                '**How to Verify:**\n' +
                'Click the "Verify Now" button below.\n\n' +
                '**After Verification, you\'ll gain access to:**\n' +
                '• **Application Center** - Apply to get into the faction.\n\n' +
                'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
                '**Welcome to the Cascadian Armed Forces.**',
            );
        container.addTextDisplayComponents(description);

        // const description1 = new TextDisplayBuilder()
        //     .setContent(
        //         '⁍ **Application Center** - Apply to get into the faction.\n\n' +
        //         'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
        //         '**Welcome to the Cascadian Armed Forces.**',
        //     );
        // container.addTextDisplayComponents(description1);
        // container.addSectionComponents((section) =>
        //     section
        //         .setButtonAccessory((button) =>
        //             button.setCustomId('startVerification').setLabel('Verify Now').setStyle(ButtonStyle.Primary).setEmoji({ name: '✅' }),
        //         )
        //         .addTextDisplayComponents(
        //             (textDisplay) => textDisplay.setContent(
        //                 '**After Verification, you\'ll gain access to:**\n' +
        //                 '⁍ **Application Center** - Apply to get into the faction.\n\n' +
        //                 'Need help? Contact <@&1454232274273959957>+ personnel.\n\n' +
        //                 '**Welcome to the Cascadian Armed Forces.**',
        //             ),
        //         ),
        // );
        const separator2 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator2);

        const buttonRow1 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('startVerification')
                    .setLabel('Verify Now')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔐'),
            );
        container.addActionRowComponents(buttonRow1);

        return container;
    },
    2: () => {
        // Message ID 2: Application Center
        const container = new ContainerBuilder()
            .setAccentColor(0x57F287);

        const title = new TextDisplayBuilder()
            .setContent('## Application Center');
        container.addTextDisplayComponents(title);
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        const description = new TextDisplayBuilder()
            .setContent(
                '**Ready to join the Cascadian Armed Forces [CASF]?**\n\n' +
                'This is where your journey begins! Follow these steps to submit your application.\n\n' +
                '## Application Steps:\n' +
                `**1.** Send a join request to the **${CUSTOM_EMOJIS.roblox.default} Roblox Group**\n` +
                '**2.** Click **"Start Application"** below\n' +
                '**3.** Complete the application form\n' +
                '**4.** Wait for review by our team\n\n' +
                '## Important Notes:\n' +
                `• Ensure your ${CUSTOM_EMOJIS.roblox.default} Roblox account is verified\n` +
                '• Answer all questions honestly\n' +
                '• Applications are reviewed within 24-48 hours\n\n' +
                '_Questions? Contact <@&1454232274273959957>+ personnel for assistance._',
            );
        container.addTextDisplayComponents(description);

        const separator2 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator2);

        const buttonRow1 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('startApplication')
                    .setLabel('Start Application')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Roblox Group')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.roblox.com/communities/11590462/Cascadian-Armed-Forces-CASF#!/about')
                    .setEmoji('🎮'),
            );
        container.addActionRowComponents(buttonRow1);

        return container;
    },
    3: () => {
        // Message ID 3: Main Information Hub 1454535180596285588
        const container = new ContainerBuilder()
            .setAccentColor(0x3498DB);

        const title = new TextDisplayBuilder()
            .setContent('## Cascadian Armed Forces Information Hub');
        container.addTextDisplayComponents(title);

        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);
        // Further components can be added here as needed

        const welcome = new TextDisplayBuilder()
            .setContent(
                '## Welcome to Cascadian Armed Forces\n' +
                '**Founders:** <@266377167875735553> and <@824154609702141963>\n' +
                '**Founded:** *December 20, 2025*',
            );
        container.addTextDisplayComponents(welcome);

        const separator2 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator2);

        const mission = new TextDisplayBuilder()
            .setContent(
                '## Our Mission\n' +
                'CASF was founded to provide a structured, semi-military roleplay environment focused on teamwork, training, and progression. Our community is built on learning together, improving together, and opening the door to countless operational possibilities.\n\n' +
                'The faction is organized into multiple Branches, each containing its own specialized Divisions, supported by dedicated Departments. Alongside this, our Lore Department drives an evolving and immersive storyline that unifies the faction and gives every member a role in shaping CASF’s future.',
            );
        container.addTextDisplayComponents(mission);

        const separator3 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator3);

        const vision = new TextDisplayBuilder()
            .setContent(
                '## Our Vision\n' +
                'The vision of CASF is to unite individuals under a shared standard to deliver a strong, immersive military community experience while fostering mutual respect and camaraderie among its members. CASF is not limited to BRM5/PL5 alone; we operate as a multi-platform faction that hosts custom operations, training exercises, and community events.\n\n' +
                'With a long-term objective to expand beyond Roblox, CASF aims to establish a presence across the wider gaming space, including titles such as Arma 3, while maintaining structure, realism, and community at its core.',
            );
        container.addTextDisplayComponents(vision);

        const separator4 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator4);

        const infoSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('factionInfoSelect')
                    .setPlaceholder('Select faction information')
                    .addOptions(
                        {
                            label: 'Start Guide',
                            value: 'faction_start_guide',
                            description: 'New member orientation and steps',
                            emoji: '📌',
                        },
                        {
                            label: 'Branches & Divisions',
                            value: 'faction_branches_divisions',
                            description: 'Core structure and specialties',
                            emoji: '🎖️',
                        },
                        {
                            label: 'Departments',
                            value: 'faction_departments',
                            description: 'Support and operations groups',
                            emoji: '📋',
                        },
                        {
                            label: 'Ranks & Progression',
                            value: 'faction_ranks_progression',
                            description: 'Rank ladder and requirements',
                            emoji: '📈',
                        },
                        {
                            label: 'Training & Events',
                            value: 'faction_training_events',
                            description: 'Schedules, formats, expectations',
                            emoji: '🎯',
                        },
                        {
                            label: 'Lore',
                            value: 'faction_lore',
                            description: 'Faction history and story',
                            emoji: '📖',
                        },
                    ),
            );
        container.addActionRowComponents(infoSelectRow);


        return container;
    },
    4: () => {
        // Message ID 4: Induction Request Format
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
    },
    5: () => {
        // Message ID 5: Event Polls.
        const container = new ContainerBuilder()
            .setAccentColor(0xF39C12);

        const title = new TextDisplayBuilder()
            .setContent('## 📢 Event Polls');
        container.addTextDisplayComponents(title);
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        const description = new TextDisplayBuilder()
            .setContent(
                'Use this channel to notify troops of a deployment, the time it will occur, and to confirm attendance. Copy/paste the template and fill every line.\n\n' +
                '**⚠️ Notice:** Some events require specific ranks or certifications. Verify eligibility before affirming attendance.\n\n' +
                '## 📝 Deployment Template (Copy/Paste)\n' +
                '```\n' +
                '[DEPLOYMENT CATEGORY]: Combat Patrol | Roleplay | Story\n' +
                '\n' +
                '[MISSION IMPORTANCE]: Low | Medium | High | Critical\n' +
                '[DEPLOYMENT LEAD]: (@Mention)\n' +

                '[OPERATION]: Operation Name\n' +
                '[EVENT TIME]:(USE HAMMERTIME)\n' +
                '[MINIMUM ATTENDANCE]: #\n' +
                '[DEPLOYMENT DETAILS]: Brief overvieinw + objectives\n' +
                '[REQUIRED RANK/CERTS]: None / List here\n' +
                '[SPECIFICATIONS]: PTS WILL BE ENABLED.\n' +
                '```\n\n' +
                '⏱️ **Hammertime:** https://hammertime.cyou/',
            );
        container.addTextDisplayComponents(description);

        return container;
    },
    6: () => {
        // Message ID 6: Training Information
        const container = new ContainerBuilder()
            .setAccentColor(0xE67E22);

        const title = new TextDisplayBuilder()
            .setContent('## 🛡️ Training Department');
        container.addTextDisplayComponents(title);

        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        const overview = new TextDisplayBuilder()
            .setContent(
                '## Department Overview\n' +
                'The Training Department is responsible for training new Initiates to allow them to enter the Cascadian Armed Forces. You will be responsible in managing trainings, in which you will show the basics to the trainee. This is a skill test - if they don\'t pass, we will have to redo the training.',
            );
        container.addTextDisplayComponents(overview);

        const separator2 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator2);

        const responsibilities = new TextDisplayBuilder()
            .setContent(
                '## Training Officer Responsibilities\n' +
                '• Use **Hammertime** to indicate the correct time for trainings in <#1454555912491761875>\n' +
                '• Monitor induction requests in <#1454556030988980446>\n' +
                '• Ensure trainees use Hammertime for scheduling\n' +
                '• Follow the Training Document guidelines:\n' +
                '  - **Orange underlined text** = Instructions for Training Officers\n' +
                '  - **Yellow underlined text** = What to say to Trainees\n' +
                '• Report any document errors to <@471739867332739092>',
            );
        container.addTextDisplayComponents(responsibilities);

        const separator3 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator3);

        const leadership = new TextDisplayBuilder()
            .setContent(
                '## Chain of Command\n' +
                '**[Training Academy Chief]** <@471739867332739092>\n\n' +
                '```\nCHAIN OF COMMAND\n\nN/A\n```',
            );
        container.addTextDisplayComponents(leadership);

        const separator4 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator4);

        const resources = new TextDisplayBuilder()
            .setContent(
                '## Training Resources\n' +
                '**Training Private Server Code:**\n' +
                '```\nba9dc4c8-e66b-4343-ba81-3411626e19b6\n```',
            );
        container.addTextDisplayComponents(resources);

        const separator5 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator5);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Training Document')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://docs.google.com/document/d/16Xb03qIZy_eYVmW5_Z88jSKyPTyNleA8LrzZLBzEpas/edit?usp=sharing')
                    .setEmoji('📄'),
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Hammertime')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://hammertime.cyou/')
                    .setEmoji('⏱️'),
            );
        container.addActionRowComponents(buttonRow);

        return container;
    }
};
