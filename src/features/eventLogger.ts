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
    embed: EmbedBuilder,
) {
    // logChannels not in config, so this function is a stub or needs refactor
    // You may want to implement your own channel mapping here
    return;
}
