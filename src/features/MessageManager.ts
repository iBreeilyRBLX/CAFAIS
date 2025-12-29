import { Client, TextChannel, WebhookClient, ContainerBuilder, TextDisplayBuilder, MessageFlags } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { containerRegistry } from '../messages/containerRegistry';

interface MessageIndex {
    messages: {
        id: number;
        name: string;
        channelId: string;
    }[];
}

export class MessageManager {
    private client: Client;
    private messagesDir: string;
    private index: MessageIndex;
    private webhooks: Map<string, WebhookClient>;

    constructor(client: Client) {
        this.client = client;
        this.messagesDir = path.join(__dirname, '..', '..', 'src', 'messages');
        this.index = this.loadIndex();
        this.webhooks = new Map();
    }

    private loadIndex(): MessageIndex {
        const indexPath = path.join(this.messagesDir, 'index.json');
        if (!fs.existsSync(indexPath)) {
            console.error(`Messages directory not found at: ${this.messagesDir}`);
            throw new Error(`Messages directory not found at: ${this.messagesDir}`);
        }
        return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    }

    private prepareContainerMessage(container: ContainerBuilder) {
        return {
            flags: Number(MessageFlags.IsComponentsV2),
            components: [container],
        };
    }

    private async getOrCreateWebhook(messageInfo: { id: number; name: string; channelId: string }, channel: TextChannel): Promise<WebhookClient> {
        // Use only channelId as key so all messages in same channel share the same webhook
        const cacheKey = channel.id;

        // If we already have a webhook client for this channel, return it
        const cachedWebhook = this.webhooks.get(cacheKey);
        if (cachedWebhook) {
            return cachedWebhook;
        }

        // Find the first message in index.json for this channel to determine webhook name
        const firstMessageInChannel = this.index.messages.find(msg => msg.channelId === messageInfo.channelId);
        const webhookName = firstMessageInChannel ? firstMessageInChannel.name : messageInfo.name;

        // Look for existing webhook in channel with the determined name (same method as reactionRoles.ts)
        const existingWebhooks = await channel.fetchWebhooks();
        const existingWebhook = existingWebhooks.find((w) => w.name === webhookName) || null;

        let webhookClient: WebhookClient;
        if (existingWebhook && existingWebhook.token) {
            // Use existing webhook
            webhookClient = new WebhookClient({
                id: existingWebhook.id,
                token: existingWebhook.token,
            });
        }
        else {
            // Create new webhook with the name of the first message in this channel
            const webhook = await channel.createWebhook({
                name: webhookName,
                // avatar: '',
            });

            if (!webhook.token) {
                throw new Error('Failed to create webhook: no token received');
            }

            webhookClient = new WebhookClient({
                id: webhook.id,
                token: webhook.token,
            });
        }

        this.webhooks.set(cacheKey, webhookClient);
        return webhookClient;
    }

    /**
     * Ensures a message exists in the channel.
     * Only sends if no message from this webhook exists in the channel.
     * This is called on bot startup to deploy/update messages.
     */
    async ensureMessage(messageId: number) {
        const messageInfo = this.index.messages.find(m => m.id === messageId);
        if (!messageInfo) {
            throw new Error(`Message with ID ${messageId} not found`);
        }

        const channel = await this.client.channels.fetch(messageInfo.channelId) as TextChannel;
        if (!channel) {
            throw new Error(`Channel ${messageInfo.channelId} not found`);
        }

        // Check if container builder exists
        if (!containerRegistry[messageId]) {
            throw new Error(`No container builder found for message ${messageId}`);
        }

        const webhook = await this.getOrCreateWebhook(messageInfo, channel);

        // Simple duplicate check: see if webhook has already sent any messages in this channel
        const hasExistingMessages = await this.webhookHasMessages(webhook, channel);

        if (!hasExistingMessages) {
            console.log(`[INFO] No existing messages from webhook, sending message ${messageId} (${messageInfo.name})`);
            await this.sendMessageWithTempSystem(webhook, messageId, messageInfo);
            console.log(`[INFO] Sent message ${messageId} (${messageInfo.name})`);
        }
        else {
            console.log(`[INFO] Webhook already has messages in channel, skipping ${messageId} (${messageInfo.name})`);
        }
    }

    /**
     * Simple check to see if a webhook has already sent messages in a channel
     */
    private async webhookHasMessages(webhook: WebhookClient, channel: TextChannel): Promise<boolean> {
        try {
            const messages = await channel.messages.fetch({ limit: 20 });
            return messages.some(msg => msg.webhookId === webhook.id);
        }
        catch (error) {
            console.error('Error checking for existing webhook messages:', error);
            // If we can't check, assume no messages and proceed
            return false;
        }
    }

    /**
     * Sends a message using the temporary message system to prevent mass pinging.
     * First sends a temporary placeholder message, then edits it to the final content.
     */
    private async sendMessageWithTempSystem(webhook: WebhookClient, messageId: number, messageInfo: { id: number; name: string; channelId: string }) {
        try {
            // Step 1: Send temporary placeholder message (without Components V2 flag to allow content)
            console.log(`[INFO] Sending temporary placeholder for ${messageInfo.name}`);
            // temp container

            const tempContainer = new ContainerBuilder();

            const title = new TextDisplayBuilder()
                .setContent('# temp container');
            tempContainer.addTextDisplayComponents(title);

            const tempMessage = await webhook.send({
                components: [tempContainer],
                flags: Number(MessageFlags.IsComponentsV2),
            });

            // Small delay to ensure message is sent
            await new Promise(resolve => setTimeout(resolve, 500));

            // Step 2: Build final message content
            const containerBuilder = containerRegistry[messageId];
            const finalContainer = containerBuilder();
            const messageContent = this.prepareContainerMessage(finalContainer);

            // Step 3: Edit the temporary message to final content (now with Components V2)
            console.log(`[INFO] Updating temporary message to final content for ${messageInfo.name}`);
            await webhook.editMessage(tempMessage.id, messageContent);

            console.log(`[INFO] Successfully deployed ${messageInfo.name} using temp message system`);
        }
        catch (error) {
            console.error(`[ERROR] Failed to send message using temp system for ${messageInfo.name}:`, error);
            // Fallback: try direct send if temp system fails
            try {
                // const containerBuilder = containerRegistry[messageId];
                // const container = containerBuilder();
                // const messageContent = this.prepareContainerMessage(container);
                // await webhook.send(messageContent);
                console.log(`[INFO] Fallback direct send successful for ${messageInfo.name}`);
            }
            catch (fallbackError) {
                console.error(`[ERROR] Fallback send also failed for ${messageInfo.name}:`, fallbackError);
                throw fallbackError;
            }
        }
    }

    /**
     * Ensures all messages exist in their respective channels.
     * This is typically called on bot startup to restore any messages that were deleted.
     * Messages that already exist are left untouched.
     */
    async ensureAllMessages() {
        // Group messages by channel ID
        const messagesByChannel = new Map<string, typeof this.index.messages>();

        for (const message of this.index.messages) {
            if (!messagesByChannel.has(message.channelId)) {
                messagesByChannel.set(message.channelId, []);
            }
            const channelMessages = messagesByChannel.get(message.channelId);
            if (channelMessages) {
                channelMessages.push(message);
            }
        }

        // Process each channel
        for (const [channelId, messages] of messagesByChannel) {
            try {
                // Special handling for Chain of Command channel (should have exactly 6 messages)
                if (this.isChainOfCommandChannel(channelId)) {
                    await this.ensureChainOfCommandMessages(messages);
                }
                else {
                    // Regular handling for other channels
                    for (const message of messages) {
                        await this.ensureMessage(message.id);
                    }
                }
            }
            catch (error) {
                console.error(`Error ensuring messages for channel ${channelId}:`, error);
            }
        }
    }

    /**
     * Check if a channel is the Chain of Command channel
     */
    private isChainOfCommandChannel(channelId: string): boolean {
        // Chain of Command channel ID from index.json
        return channelId === '949445831512195072';
    }

    /**
     * Ensures the Chain of Command channel has exactly 6 messages.
     * If not, deletes all existing messages and sends the complete set.
     */
    private async ensureChainOfCommandMessages(messages: typeof this.index.messages) {
        if (messages.length === 0) return;

        const channel = await this.client.channels.fetch(messages[0].channelId) as TextChannel;
        if (!channel) {
            throw new Error(`Channel ${messages[0].channelId} not found`);
        }

        const webhook = await this.getOrCreateWebhook(messages[0], channel);

        // Count existing messages from this webhook
        const existingMessages = await channel.messages.fetch({ limit: 50 });
        const webhookMessages = existingMessages.filter(msg => msg.webhookId === webhook.id);

        console.log(`[INFO] Chain of Command channel has ${webhookMessages.size} existing messages, should have 6`);

        // If we don't have exactly 6 messages, clean up and resend all
        if (webhookMessages.size !== 6) {
            console.log(`[INFO] Incorrect number of Chain of Command messages (${webhookMessages.size}/6), cleaning up and resending all`);

            // Delete all existing webhook messages
            for (const [, msg] of webhookMessages) {
                try {
                    await msg.delete();
                    console.log(`[INFO] Deleted existing Chain of Command message: ${msg.id}`);
                }
                catch (deleteError) {
                    console.error(`[ERROR] Failed to delete message ${msg.id}:`, deleteError);
                }
            }

            // Wait a bit for deletions to process
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Send all 6 messages in order
            console.log('[INFO] Sending complete Chain of Command set (6 messages)');
            for (const message of messages.sort((a, b) => a.id - b.id)) {
                try {
                    console.log(`[INFO] Sending Chain of Command message ${message.id}`);
                    await this.sendMessageWithTempSystem(webhook, message.id, message);
                    // Small delay between messages to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
                catch (error) {
                    console.error(`[ERROR] Failed to send Chain of Command message ${message.id}:`, error);
                }
            }
            console.log('[INFO] Completed sending Chain of Command set');
        }
        else {
            console.log('[INFO] Chain of Command channel has correct number of messages (6), no action needed');
        }
    }

    getMessageList() {
        return this.index.messages.map(m => ({
            id: m.id,
            name: m.name,
            channelId: m.channelId,
        }));
    }
}