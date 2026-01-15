import dotenv from 'dotenv';

dotenv.config();

interface TaseCheckResult {
    userId?: string;
    username?: string;
    description?: string;
    safe?: boolean;
    results?: Array<{
        id: string;
        name: string;
        emoji: string;
        summary?: string;
        matched?: boolean;
    }>;
}

class TaseService {
    private static instance: TaseService;
    private readonly apiBase = 'https://tase.thegoober.xyz/api/v2';

    private constructor() {}

    public static getInstance(): TaseService {
        if (!TaseService.instance) {
            TaseService.instance = new TaseService();
        }
        return TaseService.instance;
    }

    private getApiKey(): string {
        const apiKey = process.env.TASE;
        if (!apiKey) {
            throw new Error('TASE API key not configured. Set TASE in the environment.');
        }
        return apiKey;
    }

    public async checkUser(userId: string): Promise<{ safe: boolean; description: string; results: Array<{ name: string; emoji: string; matched: boolean }> }> {
        const apiKey = this.getApiKey();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const response = await fetch(`${this.apiBase}/check/${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                signal: controller.signal,
            });

            if (response.status === 404) {
                return {
                    safe: true,
                    description: 'User not found in database',
                    results: [],
                };
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(`TASE check failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
            }

            const text = await response.text();
            if (!text || text.trim().length === 0) {
                return {
                    safe: true,
                    description: 'User not in database',
                    results: [],
                };
            }

            const data = JSON.parse(text) as TaseCheckResult;

            const safe = data.safe ?? true;
            const description = data.description ?? (safe ? '✅ User is safe' : '⚠️ User has flags');
            const results = (data.results ?? []).map((r) => ({
                name: r.name,
                emoji: r.emoji ?? '📌',
                matched: r.matched ?? false,
            }));

            return { safe, description, results };
        }
        catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.error('[ERROR] TASE check timed out');
                return {
                    safe: true,
                    description: 'Check timed out',
                    results: [],
                };
            }
            console.error('[ERROR] TASE check failed:', error);
            return {
                safe: true,
                description: 'Unable to validate',
                results: [],
            };
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
}

export default TaseService.getInstance();
