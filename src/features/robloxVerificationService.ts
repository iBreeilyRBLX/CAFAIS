import crypto from 'crypto';
import prisma from '../database/prisma';
import dotenv from 'dotenv';
dotenv.config();

interface RobloxUser {
    id: number;
    name: string;
    displayName: string;
}

interface VerificationResult {
    success: boolean;
    message: string;
    userData?: RobloxUser;
}

class RobloxVerificationService {
    private static instance: RobloxVerificationService;
    private readonly ROBLOX_API_BASE = 'https://users.roblox.com/v1/users';
    private readonly ROBLOX_OAUTH_BASE = 'https://apis.roblox.com/oauth/v1';
    private readonly DISCORD_OAUTH_BASE = 'https://discord.com/api/oauth2';

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static getInstance(): RobloxVerificationService {
        if (!RobloxVerificationService.instance) {
            RobloxVerificationService.instance = new RobloxVerificationService();
        }
        return RobloxVerificationService.instance;
    }

    /**
     * Generate Discord OAuth authorization URL
     */
    public generateDiscordAuthUrl(stateToken: string): string {
        const clientId = process.env.DISCORD_CLIENT_ID;
        const baseUrl = process.env.OAUTH_BASE_URL;
        if (!clientId || !baseUrl) {
            throw new Error('Discord OAuth credentials not configured');
        }
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            // eslint-disable-next-line no-inline-comments
            scope: process.env.DISCORD_OAUTH_SCOPES || 'identify', // dm_channels.messages.write',
            redirect_uri: `${baseUrl}/oauth/discord/callback`,
            state: stateToken,
        });
        return `${this.DISCORD_OAUTH_BASE}/authorize?${params.toString()}`;
    }

    /**
     * Generate Roblox OAuth authorization URL (legacy - now step 2)
     */
    public async generateAuthorizationUrl(discordId: string, userTag: string): Promise<{ url: string; stateToken: string }> {
        const clientId = process.env.ROBLOX_CLIENT_ID;
        const baseUrl = process.env.OAUTH_BASE_URL;
        if (!clientId || !baseUrl) {
            throw new Error('Roblox OAuth credentials not configured');
        }
        const stateToken = crypto.randomBytes(32).toString('hex');
        await prisma.oauthState.create({
            data: {
                stateToken,
                discordId,
                discordUserTag: userTag,
            },
        });
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            scope: 'openid profile',
            redirect_uri: `${baseUrl}/oauth/callback`,
            state: stateToken,
        });
        const url = `${this.ROBLOX_OAUTH_BASE}/authorize?${params.toString()}`;
        return { url, stateToken };
    }

    /**
     * Verify OAuth state token (CSRF protection)
     */
    public async verifyStateToken(stateToken: string): Promise<{ valid: boolean; discordId?: string; userTag?: string }> {
        const state = await prisma.oauthState.findFirst({
            where: {
                stateToken,
                expiresAt: { gt: new Date() },
            },
        });
        if (!state) return { valid: false };
        await prisma.oauthState.delete({ where: { stateToken } });
        return { valid: true, discordId: state.discordId, userTag: state.discordUserTag ?? undefined };
    }

    /**
     * Exchange Discord authorization code for access token and user info
     */
    public async exchangeDiscordCodeForUser(code: string): Promise<{ id: string; username: string; discriminator: string } | null> {
        const clientId = process.env.DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;
        const baseUrl = process.env.OAUTH_BASE_URL;
        if (!clientId || !clientSecret || !baseUrl) {
            throw new Error('Discord OAuth credentials not configured');
        }

        try {
            // Exchange code for token
            const tokenResponse = await fetch(`${this.DISCORD_OAUTH_BASE}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: `${baseUrl}/oauth/discord/callback`,
                }).toString(),
            });

            if (!tokenResponse.ok) {
                console.error('Discord token exchange failed:', tokenResponse.status, await tokenResponse.text());
                return null;
            }

            const tokenData = (await tokenResponse.json()) as { access_token: string };

            // Fetch user info with access token
            const userResponse = await fetch(`${this.DISCORD_OAUTH_BASE.replace('/oauth2', '')}/users/@me`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            });

            if (!userResponse.ok) {
                console.error('Discord user fetch failed:', userResponse.status);
                return null;
            }

            const userData = (await userResponse.json()) as { id: string; username: string; discriminator: string };
            return userData;
        }
        catch (error) {
            console.error('Error exchanging Discord code:', error);
            return null;
        }
    }

    /**
     * Exchange Roblox authorization code for access token
     */
    public async exchangeCodeForToken(code: string): Promise<string | null> {
        const clientId = process.env.ROBLOX_CLIENT_ID;
        const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
        const baseUrl = process.env.OAUTH_BASE_URL;
        if (!clientId || !clientSecret || !baseUrl) {
            throw new Error('Roblox OAuth credentials not configured');
        }

        try {
            const response = await fetch(`${this.ROBLOX_OAUTH_BASE}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: `${baseUrl}/oauth/callback`,
                }).toString(),
            });

            if (!response.ok) {
                console.error('Roblox token exchange failed:', response.status, await response.text());
                return null;
            }

            const data = (await response.json()) as { access_token: string };
            return data.access_token;
        }
        catch (error) {
            console.error('Error exchanging code for token:', error);
            return null;
        }
    }

    /**
     * Fetch Roblox user info from access token
     */
    public async getRobloxUserFromToken(accessToken: string): Promise<RobloxUser | null> {
        try {
            const response = await fetch(`${this.ROBLOX_OAUTH_BASE}/userinfo`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch Roblox user info:', response.status);
                return null;
            }

            const data = await response.json();

            // Roblox OAuth returns: sub (user ID), preferred_username (username), nickname (display name)
            const robloxUser = {
                id: parseInt(data.sub),
                name: data.preferred_username || data.name,
                displayName: data.nickname || data.preferred_username || data.name,
            };

            return robloxUser;
        }
        catch (error) {
            console.error('Error fetching Roblox user info:', error);
            return null;
        }
    }

    /**
     * Fetch Roblox user info by Roblox user ID (public profile)
     */
    public async getRobloxUserById(robloxId: number): Promise<RobloxUser | null> {
        try {
            const response = await fetch(`${this.ROBLOX_API_BASE}/${robloxId}`);
            if (!response.ok) {
                console.error('Failed to fetch Roblox user by ID:', response.status);
                return null;
            }

            const data = (await response.json()) as { id: number; name?: string; displayName?: string };
            if (!data?.id) {
                console.error('Roblox user by ID returned invalid data:', data);
                return null;
            }

            return {
                id: data.id,
                name: data.name || `User${data.id}`,
                displayName: data.displayName || data.name || `User${data.id}`,
            };
        }
        catch (error) {
            console.error('Error fetching Roblox user by ID:', error);
            return null;
        }
    }

    /**
     * Complete verification: store Discord-Roblox link
     */
    public async completeVerification(discordId: string, robloxUser: RobloxUser): Promise<VerificationResult> {
        // Check if this Roblox account is already linked to a different Discord account
        const robloxLink = await prisma.verifiedUser.findFirst({
            where: {
                robloxId: BigInt(robloxUser.id),
                NOT: { discordId },
            },
        });
        if (robloxLink) {
            return {
                success: false,
                message: `❌ This Roblox account (**${robloxUser.displayName}**) is already verified with another Discord account. Alt accounts are not allowed.`,
            };
        }

        // Ensure UserProfile exists first (required for foreign key constraint)
        try {
            console.log(`[VERIFICATION] Ensuring UserProfile exists for Discord ID: ${discordId}`);
            await prisma.userProfile.upsert({
                where: { discordId },
                update: {},
                create: {
                    discordId,
                    username: 'Unknown', // Will be updated when user interacts with bot
                    discriminator: '0000',
                },
            });
            console.log(`[VERIFICATION] UserProfile upsert successful for Discord ID: ${discordId}`);
        }
        catch (profileError) {
            console.error(`[VERIFICATION] Failed to upsert UserProfile for ${discordId}:`, profileError);
            return {
                success: false,
                message: 'Failed to create user profile. Please try again.',
            };
        }

        // Upsert verification
        try {
            console.log(`[VERIFICATION] Creating/updating VerifiedUser for Discord ID: ${discordId}`);
            await prisma.verifiedUser.upsert({
                where: { discordId },
                update: {
                    robloxId: BigInt(robloxUser.id),
                    robloxUsername: robloxUser.name,
                    robloxDisplayName: robloxUser.displayName,
                    updatedAt: new Date(),
                },
                create: {
                    discordId,
                    robloxId: BigInt(robloxUser.id),
                    robloxUsername: robloxUser.name,
                    robloxDisplayName: robloxUser.displayName,
                },
            });
            console.log(`[VERIFICATION] VerifiedUser upsert successful for Discord ID: ${discordId}`);
            return {
                success: true,
                message: `✅ Verification successful! Linked to **${robloxUser.displayName}** (@${robloxUser.name})`,
                userData: robloxUser,
            };
        }
        catch (verificationError) {
            console.error(`[VERIFICATION] Failed to upsert VerifiedUser for ${discordId}:`, verificationError);
            return {
                success: false,
                message: 'Failed to save verification data. Please try again.',
            };
        }
    }

    /**
     * Get verified Roblox user for a Discord ID
     */
    public async getVerifiedUser(discordId: string): Promise<RobloxUser | null> {
        const user = await prisma.verifiedUser.findUnique({ where: { discordId } });
        if (!user) return null;
        return {
            id: Number(user.robloxId),
            name: user.robloxUsername,
            displayName: user.robloxDisplayName,
        };
    }

    /**
     * Check if a Discord user is verified
     */
    public async isVerified(discordId: string): Promise<boolean> {
        const user = await prisma.verifiedUser.findUnique({ where: { discordId } });
        return !!user;
    }

    /**
     * Remove verification for a Discord user
     */
    public async removeVerification(discordId: string): Promise<boolean> {
        try {
            await prisma.verifiedUser.delete({ where: { discordId } });
            return true;
        }
        catch {
            return false;
        }
    }
}

export default RobloxVerificationService.getInstance();
