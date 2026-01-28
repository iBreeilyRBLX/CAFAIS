import { ContainerBuilder } from 'discord.js';
import {
    buildVerificationContainer,
    buildApplicationContainer,
    buildHubContainer,
    buildInductionFormatContainer,
    buildDepartmentContainer,
    buildAcademyPollsContainer,
    buildEventPollsContainer,
    buildTrainingAnnouncementsContainer,
} from './containers';

/**
 * Central registry mapping message IDs to their container builders
 * Add new messages here with their corresponding ID from index.json
 */
export const containerRegistry: Record<number, () => ContainerBuilder> = {
    1: buildVerificationContainer,
    2: buildApplicationContainer,
    3: buildHubContainer,
    4: buildInductionFormatContainer,
    5: buildDepartmentContainer,
    6: buildAcademyPollsContainer,
    7: buildTrainingAnnouncementsContainer,
    8: buildEventPollsContainer,
};
