import { DiscordjsError, GatewayIntentBits as Intents, Partials } from 'discord.js';
import ExtendedClient from './classes/Client';
import { config } from 'dotenv';

// Load .env file contents
config();

// Initialization (specify intents and partials)
new ExtendedClient({
    intents: [
        Intents.Guilds,
        Intents.GuildMembers,
        Intents.GuildBans,
        Intents.GuildEmojisAndStickers,
        Intents.GuildIntegrations,
        Intents.GuildWebhooks,
        Intents.GuildInvites,
        Intents.GuildVoiceStates,
        Intents.GuildPresences,
        Intents.GuildMessages,
        Intents.GuildMessageReactions,
        Intents.GuildMessageTyping,
        Intents.DirectMessages,
        Intents.DirectMessageReactions,
        Intents.DirectMessageTyping,
        Intents.MessageContent,
        Intents.GuildScheduledEvents,
        Intents.AutoModerationConfiguration,
        Intents.AutoModerationExecution,
        Intents.GuildModeration,
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.GuildScheduledEvent,
    ],
}).login(process.env.TOKEN)
    .catch((err:unknown) => {
        if (err instanceof DiscordjsError) {
            if (err.code == 'TokenMissing') console.warn(`\n[Error] ${err.name}: ${err.message} Did you create a .env file?\n`);
            else if (err.code == 'TokenInvalid') console.warn(`\n[Error] ${err.name}: ${err.message} Check your .env file\n`);
            else throw err;
        }
        else {
            throw err;
        }
    });