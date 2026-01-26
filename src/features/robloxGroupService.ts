import noblox from 'noblox.js';
import dotenv from 'dotenv';

dotenv.config();

class RobloxGroupService {
    private static instance: RobloxGroupService;
    private isAuthenticated = false;
    private authPromise: Promise<void> | undefined;
    private readonly defaultGroupId = parseInt(process.env.ROBLOX_GROUP_ID ?? '11590462', 10);

    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
    private constructor() {}

    public static getInstance(): RobloxGroupService {
        if (!RobloxGroupService.instance) {
            RobloxGroupService.instance = new RobloxGroupService();
        }
        return RobloxGroupService.instance;
    }

    private async ensureAuthenticated(): Promise<void> {
        if (this.isAuthenticated) return;
        if (this.authPromise) return this.authPromise;

        const cookie = process.env.ROBLOX_BOT_COOKIE;
        if (!cookie) {
            throw new Error('Roblox bot cookie not configured. Set ROBLOX_BOT_COOKIE in the environment.');
        }

        this.authPromise = noblox
            .setCookie(cookie)
            .then(() => {
                this.isAuthenticated = true;
            })
            .catch((error) => {
                this.authPromise = undefined;
                throw error;
            });

        return this.authPromise;
    }

    public async userHasPendingJoinRequest(robloxUserId: number, groupId?: number): Promise<boolean> {
        const resolvedGroupId = groupId ?? this.defaultGroupId;
        if (!resolvedGroupId || Number.isNaN(resolvedGroupId)) {
            throw new Error('Roblox group id not configured. Set ROBLOX_GROUP_ID in the environment.');
        }

        await this.ensureAuthenticated();

        try {
            const request = await noblox.getJoinRequest(resolvedGroupId, robloxUserId);
            return !!request;
        }
        catch (error: unknown) {
            const maybeError = error as { response?: { status?: number }; statusCode?: number; message?: string } | undefined;
            const status = maybeError?.response?.status ?? maybeError?.statusCode;

            // Roblox API returns 404 when the user does not have a pending join request
            if (status === 404 || maybeError?.message?.includes('404')) {
                return false;
            }

            console.error('[ERROR] Failed to check Roblox join request:', error);
            throw new Error('Unable to validate Roblox group join status right now.');
        }
    }

    public async userIsMember(robloxUserId: number, groupId?: number): Promise<boolean> {
        const resolvedGroupId = groupId ?? this.defaultGroupId;
        if (!resolvedGroupId || Number.isNaN(resolvedGroupId)) {
            throw new Error('Roblox group id not configured. Set ROBLOX_GROUP_ID in the environment.');
        }

        await this.ensureAuthenticated();

        try {
            const rank = await noblox.getRankInGroup(resolvedGroupId, robloxUserId);
            return rank > 0;
        }
        catch (error: unknown) {
            const maybeError = error as { response?: { status?: number }; statusCode?: number; message?: string } | undefined;
            const status = maybeError?.response?.status ?? maybeError?.statusCode;

            // Roblox API returns 403/404 for non-members; treat as not a member
            if (status === 403 || status === 404 || maybeError?.message?.includes('not in group')) {
                return false;
            }

            console.error('[ERROR] Failed to check Roblox group membership:', error);
            throw new Error('Unable to validate Roblox group membership right now.');
        }
    }

    public async acceptPendingJoinRequest(robloxUserId: number, groupId?: number): Promise<'accepted' | 'already-member' | 'no-request'> {
        const resolvedGroupId = groupId ?? this.defaultGroupId;
        if (!resolvedGroupId || Number.isNaN(resolvedGroupId)) {
            throw new Error('Roblox group id not configured. Set ROBLOX_GROUP_ID in the environment.');
        }

        await this.ensureAuthenticated();

        if (await this.userIsMember(robloxUserId, resolvedGroupId)) {
            return 'already-member';
        }

        const hasPending = await this.userHasPendingJoinRequest(robloxUserId, resolvedGroupId);
        if (!hasPending) {
            return 'no-request';
        }

        try {
            await noblox.handleJoinRequest(resolvedGroupId, robloxUserId, true);
            return 'accepted';
        }
        catch (error) {
            console.error('[ERROR] Failed to accept Roblox group join request:', error);
            throw new Error('Unable to accept Roblox group join request right now.');
        }
    }
    public async denyPendingJoinRequest(robloxUserId: number, groupId?: number): Promise<'denied' | 'already-member' | 'no-request'> {
        const resolvedGroupId = groupId ?? this.defaultGroupId;
        if (!resolvedGroupId || Number.isNaN(resolvedGroupId)) {
            throw new Error('Roblox group id not configured. Set ROBLOX_GROUP_ID in the environment.');
        }

        await this.ensureAuthenticated();

        if (await this.userIsMember(robloxUserId, resolvedGroupId)) {
            return 'already-member';
        }

        const hasPending = await this.userHasPendingJoinRequest(robloxUserId, resolvedGroupId);
        if (!hasPending) {
            return 'no-request';
        }

        try {
            await noblox.handleJoinRequest(resolvedGroupId, robloxUserId, false);
            return 'denied';
        }
        catch (error) {
            console.error('[ERROR] Failed to deny Roblox group join request:', error);
            throw new Error('Unable to deny Roblox group join request right now.');
        }
    }

    public async removeUserFromGroup(robloxUserId: number, groupId?: number): Promise<'removed' | 'not-member'> {
        const resolvedGroupId = groupId ?? this.defaultGroupId;
        if (!resolvedGroupId || Number.isNaN(resolvedGroupId)) {
            throw new Error('Roblox group id not configured. Set ROBLOX_GROUP_ID in the environment.');
        }

        await this.ensureAuthenticated();

        if (!(await this.userIsMember(robloxUserId, resolvedGroupId))) {
            return 'not-member';
        }

        try {
            await noblox.exile(resolvedGroupId, robloxUserId);
            return 'removed';
        }
        catch (error) {
            console.error('[ERROR] Failed to remove Roblox user from group:', error);
            throw new Error('Unable to remove Roblox user from group right now.');
        }
    }
}

export default RobloxGroupService.getInstance();