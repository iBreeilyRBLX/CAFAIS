import { defineConfig } from '@prisma/config';

export default defineConfig({
    datasource: {
        provider: 'postgresql',
        url: process.env.DATABASE_URL,
    },
});
