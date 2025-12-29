import { Events, GuildMember } from 'discord.js';
import { Event } from '../../interfaces';
import ExtendedClient from '../../classes/Client';
const event: Event = {
    name: Events.GuildMemberAdd,
    execute: async (client: ExtendedClient, member: GuildMember) => {
        try {
            await member.roles.add(`${process.env.UNVERIFIED_ROLE_ID}`);
        }
        catch (error) {
            console.error('Failed to give member unverified role', error);
        }
    },
};

export default event;
