import express, { Request, Response } from 'express';
import { ranks } from '../ranks/ranks';
import robloxVerificationService from './robloxVerificationService';
import ExtendedClient from '../classes/Client';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import helmet from 'helmet';


export function setupOAuthServer(client: ExtendedClient): void {
    const app = express();
    const port = parseInt(process.env.OAUTH_SERVER_PORT || '3000', 10);

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 1. Security headers
    app.use(helmet());

    // 2. Trust proxy for secure cookies (if behind reverse proxy/load balancer)
    app.set('trust proxy', 1);

    // 3. Session middleware (secure, httpOnly, signed, strong secret)
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
        throw new Error('SESSION_SECRET must be set to a strong, unique value (32+ chars) in production!');
    }
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        },
    }));

    // 4. Serve static dashboard files securely
    app.use('/static', express.static(path.join(process.cwd(), 'src', 'features', 'static'), {
        maxAge: '7d',
        setHeaders: (res, path) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
        },
    }));

    // Dashboard page
    app.get('/dashboard', (req: Request, res: Response) => {
        const dashboardPath = path.join(process.cwd(), 'src', 'features', 'static', 'dashboard.html');
        fs.readFile(dashboardPath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Dashboard not found.');
            }
            else {
                res.status(200).send(data);
            }
        });
    });

    // API endpoint: Get user info (real session/auth logic)
    app.get('/api/user', async (req: Request, res: Response) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { discordId, robloxId } = req.session.user;
        let discord = null;
        let roblox = null;
        // Fetch Discord info
        if (discordId) {
            try {
                const guild = client.guilds.cache.first();
                const member = guild ? await guild.members.fetch(discordId) : null;
                if (member) {
                    let avatarUrl = member.user.displayAvatarURL({ extension: 'jpg', size: 128 });
                    if (!avatarUrl) avatarUrl = '/static/default-headshot.jpg';
                    discord = {
                        displayName: member.displayName || member.user.username,
                        id: member.id,
                        avatar: avatarUrl,
                    };
                }
            }
            catch (e) {
                discord = { displayName: 'Unknown', id: discordId, avatar: '/static/default-headshot.jpg' };
            }
        }
        // Fetch Roblox info
        if (robloxId) {
            try {
                // TODO: Replace with real Roblox user info fetch
                // const robloxUser = await robloxVerificationService.getRobloxUserById(robloxId);
                // For now, fallback to mock/placeholder
                roblox = {
                    displayName: 'Unknown',
                    id: robloxId,
                    avatar: '/static/default-headshot.jpg',
                };
            }
            catch (e) {
                roblox = { displayName: 'Unknown', id: robloxId, avatar: '/static/default-headshot.jpg' };
            }
        }
        res.json({ discord, roblox });
    });

    // API endpoint: Logout
    app.post('/api/logout', (req: Request, res: Response) => {
        if (req.session) req.session.destroy(() => {});
        res.status(200).json({ success: true });
    });
    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Privacy Policy page
    app.get('/privacy', (req: Request, res: Response) => {
        const privacyPath = path.join(process.cwd(), 'src', 'features', 'static', 'privacy.html');
        fs.readFile(privacyPath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Privacy Policy not found.');
            }
            else {
                res.status(200).send(data);
            }
        });
    });

    // Terms of Service page
    app.get('/terms', (req: Request, res: Response) => {
        const termsPath = path.join(process.cwd(), 'src', 'features', 'static', 'terms.html');
        fs.readFile(termsPath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Terms of Service not found.');
            }
            else {
                res.status(200).send(data);
            }
        });
    });

    // Root page redirect to Discord
    app.get('/', (req: Request, res: Response) => {
        res.redirect('https://discord.gg/casf');
    });

    // Discord OAuth callback - Step 1 of dual OAuth
    app.get('/oauth/discord/callback', async (req: Request, res: Response) => {
        try {
            const { code, state, error, error_description } = req.query as Record<string, string>;

            if (error) {
                console.error(`Discord OAuth error: ${error} - ${error_description}`);
                return res.status(400).send(
                    `<html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Discord Verification Failed</h1>
                        <p>Error: ${error}</p>
                        <p>${error_description || 'Unknown error'}</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA;">Back to Discord</a>
                    </body></html>`,
                );
            }

            if (!code || !state) {
                console.error('Discord OAuth callback missing code or state');
                return res.status(400).send(
                    `<html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Discord Verification Failed</h1>
                        <p>Missing authorization code or state.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA;">Back to Discord</a>
                    </body></html>`,
                );
            }

            // Verify state token
            const stateVerification = await robloxVerificationService.verifyStateToken(state);
            if (!stateVerification.valid || !stateVerification.discordId) {
                console.error('Invalid Discord OAuth state token');
                return res.status(400).send(
                    `<html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Verification Failed</h1>
                        <p>Invalid or expired session.</p>
                        <p>Please run <code>/verify</code> in Discord to start over.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA;">Back to Discord</a>
                    </body></html>`,
                );
            }

            const expectedDiscordId = stateVerification.discordId;

            // Exchange code for Discord user info
            const discordUser = await robloxVerificationService.exchangeDiscordCodeForUser(code);
            if (!discordUser) {
                console.error(`Failed to exchange Discord code for user ${expectedDiscordId}`);
                return res.status(500).send(
                    `<html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Discord Authentication Failed</h1>
                        <p>Could not verify your Discord account.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA;">Back to Discord</a>
                    </body></html>`,
                );
            }

            // Verify Discord ID matches
            if (discordUser.id !== expectedDiscordId) {
                console.error(`Discord ID mismatch: expected ${expectedDiscordId}, got ${discordUser.id}`);
                return res.status(403).send(
                    `<html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Account Mismatch</h1>
                        <p>The Discord account you authorized doesn't match the account that started verification.</p>
                        <p>Please run <code>/verify</code> from the correct Discord account.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA;">Back to Discord</a>
                    </body></html>`,
                );
            }

            console.info(`✅ Discord OAuth verified for ${discordUser.username} (${discordUser.id}), proceeding to Roblox OAuth...`);

            // Generate new state token for Roblox OAuth step
            const robloxAuthData = await robloxVerificationService.generateAuthorizationUrl(discordUser.id, discordUser.username);

            // Redirect to Roblox OAuth
            return res.redirect(robloxAuthData.url);
        }
        catch (error) {
            console.error('Unexpected error in Discord OAuth callback:', error);
            return res.status(500).send(
                `<html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                    <h1>❌ An Error Occurred</h1>
                    <p>Please try again.</p>
                    <a href="https://discord.gg/casf" style="color: #7289DA;">Back to Discord</a>
                </body></html>`,
            );
        }
    });

    // Roblox OAuth callback - Step 2 of dual OAuth
    app.get('/oauth/callback', async (req: Request, res: Response) => {
        try {
            const { code, state, error, error_description } = req.query as Record<string, string>;

            // Handle OAuth errors from Roblox
            if (error) {
                const errorDesc = error_description || 'Unknown error';
                console.error(`OAuth error from Roblox: ${error} - ${errorDesc}`);
                return res.status(400).send(
                    `<html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Verification Failed</h1>
                        <p>Error: ${error}</p>
                        <p>${errorDesc}</p>
                        <p>Please try again or contact support if the issue persists.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA; text-decoration: none;">Back to Discord</a>
                    </body>
                </html>`,
                );
            }

            if (!code || !state) {
                console.error('OAuth callback missing code or state');
                return res.status(400).send(
                    `<html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Verification Failed</h1>
                        <p>Missing authorization code or state token.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA; text-decoration: none;">Back to Discord</a>
                    </body>
                </html>`,
                );
            }

            // Verify state token (CSRF protection)
            const stateVerification = await robloxVerificationService.verifyStateToken(state);
            if (!stateVerification.valid || !stateVerification.discordId) {
                console.error('Invalid or expired state token');
                return res.status(400).send(
                    `<html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Verification Failed</h1>
                        <p>Invalid or expired verification session.</p>
                        <p>Please start over by running <code>/verify</code> in Discord.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA; text-decoration: none;">Back to Discord</a>
                    </body>
                </html>`,
                );
            }

            const discordId = stateVerification.discordId;

            // Exchange code for access token
            const accessToken = await robloxVerificationService.exchangeCodeForToken(code);
            if (!accessToken) {
                console.error(`Failed to exchange code for token for Discord user ${discordId}`);
                return res.status(500).send(
                    `<html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Verification Failed</h1>
                        <p>Failed to authenticate with Roblox. Please try again.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA; text-decoration: none;">Back to Discord</a>
                    </body>
                </html>`,
                );
            }

            // Fetch Roblox user info
            const robloxUser = await robloxVerificationService.getRobloxUserFromToken(accessToken);
            if (!robloxUser) {
                console.error(`Failed to fetch Roblox user info for Discord user ${discordId}`);
                return res.status(500).send(
                    `<html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Verification Failed</h1>
                        <p>Failed to retrieve your Roblox profile. Please try again.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA; text-decoration: none;">Back to Discord</a>
                    </body>
                </html>`,
                );
            }

            // Complete verification in database
            const verificationResult = await robloxVerificationService.completeVerification(discordId, robloxUser);
            if (!verificationResult.success) {
                return res.status(500).send(
                    `<html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                        <h1>❌ Verification Failed</h1>
                        <p>Failed to save verification. Please try again.</p>
                        <a href="https://discord.gg/casf" style="color: #7289DA; text-decoration: none;">Back to Discord</a>
                    </body>
                </html>`,
                );
            }

            // Try to update Discord nickname and grant roles
            try {
                const discordMember = await client.guilds.cache.first()?.members.fetch(discordId);
                if (discordMember) {
                    // Find user's rank by checking roles
                    let userRank = '';
                    for (const rank of ranks) {
                        if (discordMember.roles.cache.has(rank.discordRoleId)) {
                            userRank = rank.prefix;
                            break;
                        }
                    }

                    // Try to update nickname (non-blocking if it fails)
                    try {
                        const newNickname = userRank
                            ? `[${userRank}] ${robloxUser.displayName}`
                            : robloxUser.displayName;

                        if (newNickname.length <= 32) {
                            await discordMember.setNickname(newNickname);
                            console.info(
                                `Updated nickname for Discord user ${discordId}: "${discordMember.nickname || 'none'}" -> "${newNickname}"`,
                            );
                        }
                        else {
                            console.error(
                                `Nickname too long for Discord user ${discordId}: "${newNickname}" (${newNickname.length} chars)`,
                            );
                        }
                    }
                    catch (nicknameError) {
                        console.error(
                            `Failed to update nickname for Discord user ${discordId}: ${nicknameError instanceof Error ? nicknameError.message : String(nicknameError)}`,
                        );
                        // Continue with role granting even if nickname fails
                    }

                    // Grant verification roles (always attempt regardless of nickname result)
                    try {
                        const VERIFIED_ROLE = process.env.VERIFIED_ROLE_ID || '1454961614284656894';
                        const UNRANKED_ROLE = process.env.UNRANKED_ROLE_ID || '1454532106565845064';
                        const UNVERIFIED_ROLE = process.env.UNVERIFIED_ROLE_ID || '1454581366233628733';

                        // Add verified role to everyone
                        await discordMember.roles.add(VERIFIED_ROLE);
                        await discordMember.roles.remove(UNVERIFIED_ROLE);

                        // Add unranked role only if they don't have a rank
                        const hasRank = ranks.some((rank) => discordMember.roles.cache.has(rank.discordRoleId));
                        if (!hasRank) {
                            await discordMember.roles.add(UNRANKED_ROLE);
                        }

                        console.info(`Granted verification roles for Discord user ${discordId}`);
                    }
                    catch (roleError) {
                        console.error(
                            `Failed to grant roles for Discord user ${discordId}: ${roleError instanceof Error ? roleError.message : String(roleError)}`,
                        );
                    }
                }
            }
            catch (fetchError) {
                console.error(
                    `Failed to fetch Discord member ${discordId}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
                );
                // Don't fail verification just because member fetch failed
            }

            // Success response
            return res.status(200).send(
                `<html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; margin: 0;">
                    <div style="background: rgba(0,0,0,0.3); padding: 40px; border-radius: 10px; max-width: 500px; margin: auto;">
                        <h1>✅ Verification Successful!</h1>
                        <p style="font-size: 18px; margin: 20px 0;">You are now verified as:</p>
                        <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">${robloxUser.displayName}</p>
                        <p style="font-size: 14px; color: #ddd;">(@${robloxUser.name})</p>
                        <p style="margin-top: 30px; font-size: 16px;">Your Discord nickname has been updated with your Roblox display name.</p>
                        <p style="margin-top: 20px; font-size: 14px; color: #aaa;">You can now close this window.</p>
                    </div>
                </body>
            </html>`,
            );
        }
        catch (error) {
            console.error('Unexpected error in OAuth callback:', error);
            return res.status(500).send(
                `<html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                    <h1>❌ An Unexpected Error Occurred</h1>
                    <p>Please try again or contact support.</p>
                    <a href="https://discord.gg/casf" style="color: #7289DA; text-decoration: none;">Back to Discord</a>
                </body>
            </html>`,
            );
        }
    });

    // Start server
    app.listen(port, () => {
        const baseUrl = process.env.OAUTH_BASE_URL || 'http://localhost:' + port;
        console.log(`OAuth server listening on port ${port}`);
        console.log(`Discord OAuth callback: ${baseUrl}/oauth/discord/callback`);
        console.log(`Roblox OAuth callback: ${baseUrl}/oauth/callback`);
    });
}

export default setupOAuthServer;
