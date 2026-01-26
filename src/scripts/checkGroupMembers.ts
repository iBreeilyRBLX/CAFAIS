import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import prisma from '../database/prisma';
import config from '../config.json';

interface RobloxGroupMember {
    userId: number;
    username: string;
    displayName: string;
}

interface RobloxGroupMembersResponse {
    data: Array<{
        user: { userId: number; username: string; displayName: string };
    }>;
    nextPageCursor: string | null;
}

const ROBLOX_GROUP_ID = parseInt(process.env.ROBLOX_GROUP_ID ?? '11590462', 10);
const DISCORD_TOKEN = process.env.TOKEN;
const DISCORD_GUILD_ID = config.guild;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGroupMembersPage(cursor?: string | null): Promise<RobloxGroupMembersResponse> {
    const url = new URL(`https://groups.roblox.com/v1/groups/${ROBLOX_GROUP_ID}/users`);
    url.searchParams.set('limit', '100');
    url.searchParams.set('sortOrder', 'Asc');
    if (cursor) url.searchParams.set('cursor', cursor);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch group members: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as RobloxGroupMembersResponse;
}

async function fetchAllGroupMembers(): Promise<RobloxGroupMember[]> {
    const members: RobloxGroupMember[] = [];
    let cursor: string | null | undefined;

    do {
        const page = await fetchGroupMembersPage(cursor);
        for (const entry of page.data) {
            members.push({
                userId: entry.user.userId,
                username: entry.user.username,
                displayName: entry.user.displayName,
            });
        }
        cursor = page.nextPageCursor;
        if (cursor) await sleep(200);
    }
    while (cursor);

    return members;
}

async function run(): Promise<void> {
    if (!DISCORD_TOKEN) {
        throw new Error('Missing DISCORD token. Set TOKEN in .env');
    }
    if (!ROBLOX_GROUP_ID || Number.isNaN(ROBLOX_GROUP_ID)) {
        throw new Error('Missing Roblox group id. Set ROBLOX_GROUP_ID in .env');
    }

    console.log('[CHECK] Fetching Roblox group members...');
    const groupMembers = await fetchAllGroupMembers();
    console.log(`[CHECK] Roblox group members fetched: ${groupMembers.length}`);

    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    await client.login(DISCORD_TOKEN);
    const guild = await client.guilds.fetch(DISCORD_GUILD_ID);

    const notLinked: RobloxGroupMember[] = [];
    const leftDiscord: Array<RobloxGroupMember & { discordId: string }> = [];

    console.log('[CHECK] Fetching Discord guild members...');
    const allGuildMembers = await guild.members.fetch();
    console.log(`[CHECK] Discord guild members fetched: ${allGuildMembers.size}`);

    for (let i = 0; i < groupMembers.length; i += 100) {
        const batch = groupMembers.slice(i, i + 100);
        const robloxIds = batch.map((m) => BigInt(m.userId));
        const links = await prisma.verifiedUser.findMany({
            where: { robloxId: { in: robloxIds } },
            select: { discordId: true, robloxId: true },
        });
        const linkMap = new Map(links.map((l) => [Number(l.robloxId), l.discordId]));

        for (const member of batch) {
            const discordId = linkMap.get(member.userId);
            if (!discordId) {
                notLinked.push(member);
                continue;
            }

            try {
                await guild.members.fetch(discordId);
            }
            catch {
                leftDiscord.push({ ...member, discordId });
            }
        }

        await sleep(250);
    }

    console.log(`\n[RESULT] Linked Roblox members who left Discord: ${leftDiscord.length}`);
    leftDiscord.forEach((m) => {
        console.log(`- ${m.displayName} (@${m.username}) | Roblox: ${m.userId} | Discord: ${m.discordId}`);
    });

    console.log(`\n[RESULT] Roblox group members with no Discord link: ${notLinked.length}`);
    notLinked.forEach((m) => {
        console.log(`- ${m.displayName} (@${m.username}) | Roblox: ${m.userId}`);
    });

    const discordMemberIds = Array.from(allGuildMembers.keys());
    const linkedDiscordIds = new Set(
        (
            await prisma.verifiedUser.findMany({
                where: { discordId: { in: discordMemberIds } },
                select: { discordId: true },
            })
        ).map((link) => link.discordId),
    );

    const discordNoLink = allGuildMembers.filter((member) => !linkedDiscordIds.has(member.id));
    console.log(`\n[RESULT] Discord members with no Roblox link: ${discordNoLink.size}`);
    discordNoLink.forEach((member) => {
        const tag = member.user.discriminator === '0'
            ? member.user.username
            : `${member.user.username}#${member.user.discriminator}`;
        console.log(`- ${tag} | Discord: ${member.id}`);
    });

    await client.destroy();
    await prisma.$disconnect();
}

run().catch(async (error) => {
    console.error('[CHECK] Script failed:', error);
    await prisma.$disconnect();
    process.exit(1);
});
