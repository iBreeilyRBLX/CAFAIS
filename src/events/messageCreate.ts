import { Events, Message } from 'discord.js';
import ExtendedClient from '../classes/Client';
import { Event } from '../interfaces';

const TRAINING_ANNOUNCEMENT_CHANNELS = [
    '1454555800822611968',
    '1465078759848677561',
    '1454539774189764700',
];

const event: Event = {
    name: Events.MessageCreate,
    execute: async (client: ExtendedClient, message: Message) => {
        // Ignore messages without author or bot messages
        if (!message.author || message.author.bot) return;

        // Check if message is in a training announcement channel
        if (TRAINING_ANNOUNCEMENT_CHANNELS.includes(message.channelId)) {
            try {
                // Send DM reminder
                await message.author.send('⚠️ **Reminder:** Don\'t forget to run `/start-event` to begin tracking this training session!');
            }
            catch (error) {
                console.error('Failed to send /start-event reminder DM:', error);
            }
        }
    },
};

export default event;
