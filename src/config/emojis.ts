/**
 * Custom Emojis Configuration
 * 
 * This file contains all custom emojis used throughout the bot.
 * These emojis are uploaded to the Discord server and provide better branding.
 * 
 * Format: <:emoji_name:emoji_id> for static emojis
 *         <a:emoji_name:emoji_id> for animated emojis
 */

export const CUSTOM_EMOJIS = {
    // Discord Symbol Emojis (different colors for different themes)
    discord: {
        white: '<:DiscordSymbolWhite:1464691985481728285>',
        lightBlurple: '<:DiscordSymbolLightBlurple:1464691971053453558>',
        blurple: '<:DiscordSymbolBlurple:1464691955165298769>',
        black: '<:DiscordSymbolBlack:1464691939000582431>',
        // Default to blurple (Discord's brand color)
        default: '<:DiscordSymbolBlurple:1464691955165298769>',
    },
    
    // Roblox Emojis (black and white variants)
    roblox: {
        black: '<:RobloxBlack:1464691000516804819>',
        white: '<:RobloxWhite:1464690940521484513>',
        // Default to white (better visibility on dark theme)
        default: '<:RobloxWhite:1464690940521484513>',
    },
} as const;

/**
 * Get Discord emoji based on theme preference
 * @param theme - 'white', 'lightBlurple', 'blurple', 'black', or 'default'
 * @returns Discord emoji string
 */
export function getDiscordEmoji(theme: keyof typeof CUSTOM_EMOJIS.discord = 'default'): string {
    return CUSTOM_EMOJIS.discord[theme];
}

/**
 * Get Roblox emoji based on theme preference
 * @param theme - 'white', 'black', or 'default'
 * @returns Roblox emoji string
 */
export function getRobloxEmoji(theme: keyof typeof CUSTOM_EMOJIS.roblox = 'default'): string {
    return CUSTOM_EMOJIS.roblox[theme];
}

/**
 * Fallback to standard emoji if custom emoji is not available
 * Useful for testing or if emojis get deleted
 */
export const FALLBACK_EMOJIS = {
    discord: '💬',
    roblox: '🎮',
} as const;
