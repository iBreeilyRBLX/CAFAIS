/**
 * @fileoverview Centralized logging utility with consistent formatting
 * @module utilities/logger
 */

/* eslint-disable no-shadow */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}
/* eslint-enable no-shadow */

interface LogOptions {
    level: LogLevel;
    context: string;
    message: string;
    error?: unknown;
}

/**
 * Centralized logger with consistent formatting
 */
class Logger {
    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private formatError(error: unknown): string {
        if (error instanceof Error) {
            return `${error.message}\n${error.stack || ''}`;
        }
        return String(error);
    }

    private log(options: LogOptions): void {
        const { level, context, message, error } = options;
        const timestamp = this.formatTimestamp();
        const prefix = `[${timestamp}] [${level}] [${context}]`;

        switch (level) {
        case LogLevel.ERROR:
            if (error) {
                console.error(`${prefix} ${message}`, this.formatError(error));
            }
            else {
                console.error(`${prefix} ${message}`);
            }
            break;
        case LogLevel.WARN:
            console.warn(`${prefix} ${message}`);
            break;
        case LogLevel.INFO:
            console.log(`${prefix} ${message}`);
            break;
        case LogLevel.DEBUG:
            console.debug(`${prefix} ${message}`);
            break;
        }
    }

    public debug(context: string, message: string): void {
        this.log({ level: LogLevel.DEBUG, context, message });
    }

    public info(context: string, message: string): void {
        this.log({ level: LogLevel.INFO, context, message });
    }

    public warn(context: string, message: string): void {
        this.log({ level: LogLevel.WARN, context, message });
    }

    public error(context: string, message: string, error?: unknown): void {
        this.log({ level: LogLevel.ERROR, context, message, error });
    }
}

export const logger = new Logger();
