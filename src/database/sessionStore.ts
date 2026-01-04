import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import type { Store } from 'express-session';

const PGStore = connectPgSimple(session);

export function getSessionStore(): Store {
    return new PGStore({
        conString: process.env.DATABASE_URL,
        tableName: 'user_sessions',
        createTableIfMissing: true,
    }) as Store;
}
