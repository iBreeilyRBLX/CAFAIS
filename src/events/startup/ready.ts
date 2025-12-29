import { Events } from 'discord.js';
import { Event } from '../../interfaces';
import ExtendedClient from '../../classes/Client';
import { MessageManager } from '../../features/MessageManager';

const event: Event = {
    name: Events.ClientReady,
    once: true,
    execute: async (client: ExtendedClient) => {
        try {
            // Deploy slash commands first
            await client.deploy();

            // Skip if no-deployment flag is set, else deploys commands
            // if (!process.argv.includes('--no-deployment')) await client.deploy();
            console.log(`\nReady! Logged in as ${client.user?.tag} (${client.user?.id})\n`);

            const messageManager = new MessageManager(client);

            // Get list of all messages to deploy
            const messageList = messageManager.getMessageList();
            console.log(`Found ${messageList.length} messages to deploy`);

            // Ensure all messages exist (only sends if message was deleted)
            await messageManager.ensureAllMessages();
        }
        catch (error) {
            console.error('Error deploying startup messages: ', error);
        }
    },
};

export default event;

