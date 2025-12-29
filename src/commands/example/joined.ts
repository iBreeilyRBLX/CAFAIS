import { PermissionsBitField, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { BaseCommand } from '../../classes/BaseCommand';
import ExtendedClient from '../../classes/Client';

class JoinedCommand extends BaseCommand {
    public options = new SlashCommandBuilder()
        .setName('joined')
        .setDescription('See when you joined this server!')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages) as SlashCommandBuilder;
    public global = true;

    protected async executeCommand(_client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.inGuild()) {
            await interaction.editReply({ content: 'This command can only be used in a server.' });
            return;
        }
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        if (!member || !member.joinedAt) {
            await interaction.editReply({ content: 'Could not determine your join date.' });
            return;
        }
        const joinedDate = `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`;
        await interaction.editReply({ content: `You joined this server on ${joinedDate}.` });
    }
}

export default new JoinedCommand();
