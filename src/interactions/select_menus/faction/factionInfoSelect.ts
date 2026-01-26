import { ContainerBuilder, MessageFlags, InteractionReplyOptions } from 'discord.js';
import { StringSelectMenu } from '../../../interfaces';
import { buildStartGuideContainer } from './containers/startGuide';
import { buildBranchesDivisionsContainer } from './containers/branchesDivisions';
import { buildDepartmentsContainer } from './containers/departments';
import { buildRanksProgressionContainer } from './containers/ranksProgression';
import { buildTrainingEventsContainer } from './containers/trainingEvents';
import { buildLoreContainer } from './containers/lore';
import { buildSelectionNotFoundContainer } from './containers/selectionNotFound';

const selectMenu: StringSelectMenu = {
    name: 'factionInfoSelect',
    execute: async (_client, interaction) => {
        const selection = interaction.values[0];

        let container: ContainerBuilder;

        switch (selection) {
        case 'faction_start_guide':
            container = buildStartGuideContainer();
            break;
        case 'faction_branches_divisions':
            container = buildBranchesDivisionsContainer();
            break;
        case 'faction_departments':
            container = buildDepartmentsContainer();
            break;
        case 'faction_ranks_progression':
            container = buildRanksProgressionContainer();
            break;
        case 'faction_training_events':
            container = buildTrainingEventsContainer();
            break;
        case 'faction_lore':
            container = buildLoreContainer();
            break;
        default:
            container = buildSelectionNotFoundContainer();
            break;
        }

        const payload: InteractionReplyOptions = {
            flags: Number(MessageFlags.IsComponentsV2),
            components: [container],
            ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(payload);
            return;
        }

        await interaction.reply(payload);
    },
};

export default selectMenu;
