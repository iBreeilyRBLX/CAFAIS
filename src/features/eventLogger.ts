import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import config from '../config.json';

export enum EventLogType {
  TRAINING = 'training',
  EVENT = 'event',
  LORE = 'lore',
}

export async function logEvent(
  client: Client,
  type: EventLogType,
  embed: EmbedBuilder
) {
  const channelId = config.logChannels[type];
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId);
  if (channel && channel.isTextBased()) {
    await (channel as TextChannel).send({ embeds: [embed] });
  }
}
