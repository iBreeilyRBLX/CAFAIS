import { PermissionsBitField, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

class PingCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages) as SlashCommandBuilder;
    public global = true;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.editReply({ content: 'Pong! 🏓' });
    }
}

export default new PingCommand();