import { Events, GuildMember } from 'discord.js';
import { Event } from '../../interfaces';
import ExtendedClient from '../../classes/Client';
import prisma from '../../database/prisma';
import robloxVerificationService from '../../features/robloxVerificationService';
import robloxGroupService from '../../features/robloxGroupService';

const event: Event = {
    name: Events.GuildMemberRemove,
    execute: async (client: ExtendedClient, member: GuildMember) => {
        const discordId = member.id;

        try {
            const verifiedUser = await robloxVerificationService.getVerifiedUser(discordId);
            if (verifiedUser) {
                try {
                    await robloxGroupService.removeUserFromGroup(verifiedUser.id);
                }
                catch (error) {
                    console.error('[LEAVE] Failed to remove Roblox user from group:', error);
                }
            }

            await prisma.$transaction([
                // prisma.eventParticipant.deleteMany({ where: { userDiscordId: discordId } }),
                prisma.lOA.deleteMany({ where: { userDiscordId: discordId } }),
                prisma.rankCooldown.deleteMany({ where: { userDiscordId: discordId } }),
                prisma.rankLock.deleteMany({ where: { userDiscordId: discordId } }),
                prisma.award.deleteMany({ where: { userDiscordId: discordId } }),
                prisma.applicationSubmission.deleteMany({ where: { userDiscordId: discordId } }),
                prisma.verifiedUser.deleteMany({ where: { discordId } }),
                prisma.oauthState.deleteMany({ where: { discordId } }),
                prisma.userProfile.deleteMany({ where: { discordId } }),
            ]);
        }
        catch (error) {
            console.error(`[LEAVE] Failed to cleanup data for ${discordId}:`, error);
        }
    },
};

export default event;
