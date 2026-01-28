import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

/**
 * Message ID 3: Main Information Hub
 * Central information hub with mission, vision, and navigation
 */
export const buildHubContainer = (): ContainerBuilder => {
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
            'The faction is organized into multiple Branches, each containing its own specialized Divisions, supported by dedicated Departments. Alongside this, our Lore Department drives an evolving and immersive storyline that unifies the faction and gives every member a role in shaping CASF\'s future.',
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
};
