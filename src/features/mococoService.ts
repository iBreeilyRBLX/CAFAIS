import dotenv from 'dotenv';

dotenv.config();

interface MococoCheckUserResponse {
    success: boolean;
    userId?: string;
    username?: string;
    groupCount?: number;
    servers?: Array<string | number>;
    lastSeen?: string;
}

class MococoService {
    private static instance: MococoService;
    private readonly apiBase = 'https://api.moco-co.org';

    private constructor() {}

    public static getInstance(): MococoService {
        if (!MococoService.instance) {
            MococoService.instance = new MococoService();
        }
        return MococoService.instance;
    }

    private getApiKey(): string {
        const apiKey = process.env.MOCOCO;
        if (!apiKey) {
            throw new Error('Moco-Co API key not configured. Set MOCOCO in the environment.');
        }
        return apiKey;
    }

    private getAllowedServerIds(): string[] {
        const raw = process.env.MOCOCO_ALLOWED_SERVER_IDS;
        if (!raw) return [];

        const values = raw
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
            .map((id) => id.toLowerCase());

        return values;
    }

    private normalizeServerIds(servers: Array<string | number> | undefined): string[] {
        if (!servers) return [];
        return servers
            .map((id) => String(id).trim().toLowerCase())
            .filter(Boolean);
    }

    public async fetchUserServers(userId: string): Promise<{ servers: string[]; groupCount: number; username?: string }> {
        const apiKey = this.getApiKey();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(`${this.apiBase}/checkuser/${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                signal: controller.signal,
            });

            if (response.status === 404) {
                return { servers: [], groupCount: 0 };
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(`Moco-Co check failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
            }

            const data = (await response.json()) as MococoCheckUserResponse;
            const servers = this.normalizeServerIds(data.servers);
            const groupCount = data.groupCount ?? 0;
            const username = data.username;

            return { servers, groupCount, username };
        }
        catch (error) {
            if ((error as Error).name === 'AbortError') {
                throw new Error('Moco-Co request timed out');
            }
            console.error('[ERROR] Moco-Co user check failed:', error);
            throw error instanceof Error ? error : new Error('Unable to validate required server membership right now.');
        }
        finally {
            clearTimeout(timeoutId);
        }
    }

    public async isUserInAllowedServers(userId: string): Promise<{ allowed: boolean; matchedServerIds: string[]; userServerIds: string[]; groupCount: number; username?: string }> {
        const allowedServerIds = this.getAllowedServerIds();
        const { servers: userServerIds, groupCount, username } = await this.fetchUserServers(userId);
        const matchedServerIds = allowedServerIds.length
            ? userServerIds.filter((id) => allowedServerIds.includes(id))
            : [];

        return {
            allowed: allowedServerIds.length === 0 ? false : matchedServerIds.length > 0,
            matchedServerIds,
            userServerIds,
            groupCount,
            username,
        };
    }
}

export default MococoService.getInstance();
