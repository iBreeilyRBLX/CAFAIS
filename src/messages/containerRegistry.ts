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
                '**Founders:** @Bromack0304 and @valktovia\n' +
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
};
