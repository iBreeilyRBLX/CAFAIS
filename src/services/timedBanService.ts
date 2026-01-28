import prisma from '../database/prisma';
import ExtendedClient from '../classes/Client';

export class TimedBanService {
    private client: ExtendedClient;
    private checkInterval: NodeJS.Timeout | null = null;
    private readonly INTERVAL_MS = 86400000; // Check every 24 hours (1 day)

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    /**
     * Start the timed ban check service
     */
    public start(): void {
        if (this.checkInterval) {
            console.warn('TimedBanService is already running');
            return;
        }

        console.log('Starting TimedBanService...');
        this.checkExpiredBans();

        // Run the check every 24 hours
        this.checkInterval = setInterval(() => {
            this.checkExpiredBans();
        }, this.INTERVAL_MS);
    }

    /**
     * Stop the timed ban check service
     */
    public stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('Stopped TimedBanService');
        }
    }

    /**
     * Check for expired bans and unban the users
     */
    private async checkExpiredBans(): Promise<void> {
        try {
            const now = new Date();

            // Find all bans that have expired
            const expiredBans = await prisma.timedBan.findMany({
                where: {
                    banExpiresAt: {
                        lte: now,
                    },
                },
            });

            if (expiredBans.length === 0) {
                return;
            }

            console.log(`Found ${expiredBans.length} expired ban(s) to process`);

            for (const ban of expiredBans) {
                try {
                    const guild = this.client.guilds.cache.get(ban.guildId);
                    if (!guild) {
                        console.warn(`Guild ${ban.guildId} not found for user ${ban.userDiscordId}`);
                        // Still remove from database even if guild not found
                        await this.removeBan(ban.id);
                        continue;
                    }

                    // Try to unban the user
                    await guild.bans.remove(ban.userDiscordId, 'Timed ban expired');
                    console.log(`Unbanned user ${ban.userDiscordId} from guild ${guild.name}`);

                    // Remove from database
                    await this.removeBan(ban.id);
                } catch (error) {
                    console.error(`Error unbanning user ${ban.userDiscordId}:`, error);
                }
            }
        } catch (error) {
            console.error('Error checking expired bans:', error);
        }
    }

    /**
     * Remove a timed ban record from the database
     */
    private async removeBan(banId: string): Promise<void> {
        await prisma.timedBan.delete({
            where: { id: banId },
        });
    }

    /**
     * Manually add a timed ban (useful for appeals or manual unbans)
     */
    public async addTimedBan(userDiscordId: string, guildId: string, expiresAt: Date): Promise<void> {
        await prisma.timedBan.upsert({
            where: {
                userDiscordId_guildId: {
                    userDiscordId,
                    guildId,
                },
            },
            update: {
                banExpiresAt: expiresAt,
            },
            create: {
                userDiscordId,
                guildId,
                banExpiresAt: expiresAt,
            },
        });
    }

    /**
     * Manually remove a timed ban (for early unbans)
     */
    public async removeTimedBan(userDiscordId: string, guildId: string): Promise<void> {
        await prisma.timedBan.delete({
            where: {
                userDiscordId_guildId: {
                    userDiscordId,
                    guildId,
                },
            },
        }).catch(() => null); // Ignore if not found
    }

    /**
     * Get ban info for a user
     */
    public async getBanInfo(userDiscordId: string, guildId: string): Promise<{ banExpiresAt: Date } | null> {
        return prisma.timedBan.findUnique({
            where: {
                userDiscordId_guildId: {
                    userDiscordId,
                    guildId,
                },
            },
        });
    }
}
