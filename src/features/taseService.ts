import dotenv from 'dotenv';

dotenv.config();

interface TaseCheckResult {
    userId?: string;
    detail?: {
        appealing?: boolean;
        pastOffender?: boolean;
        scoreSum?: number;
        lastSeen?: string;
    };
    guilds?: Array<{
        id: string;
        name: string;
        score?: number;
        firstSeen?: string;
        lastSeen?: string;
        versions?: number[];
        types?: Array<{
            id: string;
            name: string;
            emoji: string;
        }>;
    }>;
}

class TaseService {
    private static instance: TaseService;
    private readonly apiBase = 'https://api.tasebot.org/api/v2';

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
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const url = `${this.apiBase}/check/${encodeURIComponent(userId)}`;
            console.log('[TASE] Making request to:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'cafais-bot/1.0',
                },
                signal: controller.signal,
            });

            console.log('[TASE] API Response:', {
                status: response.status,
                statusText: response.statusText,
                contentLength: response.headers.get('content-length'),
                contentType: response.headers.get('content-type'),
                url: response.url,
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
            console.log('[TASE] Response text length:', text.length, 'First 200 chars:', text.substring(0, 200));

            if (!text || text.trim().length === 0) {
                console.warn(`[TASE] Empty response received for user ${userId}. This may indicate an API issue or user is not in database.`);
                return {
                    safe: true,
                    description: 'User not in database',
                    results: [],
                };
            }

            const data = JSON.parse(text) as TaseCheckResult;

            // Determine if user is safe based on detail flags
            const detail = data.detail;
            const safe = !detail?.pastOffender && !detail?.appealing;

            // Build description based on flags
            let description = '✅ User is safe';
            if (detail?.pastOffender) description = '⚠️ Past offender';
            if (detail?.appealing) description = '🚨 Currently appealing';
            if (detail?.pastOffender && detail?.appealing) description = '🚨 Past offender and appealing';

            // Convert guilds to results format
            const results = (data.guilds ?? []).map((guild) => ({
                name: guild.name || 'Unknown Guild',
                emoji: guild.types?.[0]?.emoji ?? '📌',
                matched: (guild.score ?? 0) > 0,
            }));

            console.log('[TASE] Processed result:', { safe, description, resultsCount: results.length });
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
