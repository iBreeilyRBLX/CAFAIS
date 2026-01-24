/**
 * @fileoverview Input validation utilities
 * @module utilities/validation
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates a URL string
 */
export function validateUrl(url: string): ValidationResult {
    if (!url || url.trim().length === 0) {
        return { valid: false, error: 'URL cannot be empty' };
    }

    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
        }
        return { valid: true };
    }
    catch {
        return { valid: false, error: 'Invalid URL format' };
    }
}

/**
 * Validates an image URL (must be common image format)
 */
export function validateImageUrl(url: string): ValidationResult {
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
        return urlValidation;
    }

    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => lowerUrl.includes(ext));

    if (!hasValidExtension) {
        return {
            valid: false,
            error: 'Image URL must end with a valid image extension (.jpg, .png, .gif, .webp, .svg)',
        };
    }

    return { valid: true };
}

/**
 * Validates event name
 */
export function validateEventName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Event name cannot be empty' };
    }

    if (name.length > 100) {
        return { valid: false, error: 'Event name must be 100 characters or less' };
    }

    // Check for potentially harmful characters
    if (/[<>{}]/.test(name)) {
        return { valid: false, error: 'Event name contains invalid characters' };
    }

    return { valid: true };
}

/**
 * Validates notes/reason text
 */
export function validateText(text: string, maxLength = 1000): ValidationResult {
    if (!text || text.trim().length === 0) {
        return { valid: true };
    }

    if (text.length > maxLength) {
        return { valid: false, error: `Text must be ${maxLength} characters or less` };
    }

    return { valid: true };
}

/**
 * Sanitizes text by removing potentially harmful characters
 */
export function sanitizeText(text: string): string {
    return text
        .replace(/[<>]/g, '')
        .trim();
}
