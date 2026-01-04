import 'dotenv/config'; // This loads your .env file
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma', // Adjust if your schema path is different
    migrations: {
        path: 'prisma/migrations', // Usually the default
    },
    datasource: {
        url: env('DATABASE_URL'), // Reads from process.env after dotenv loads .env
    },
});