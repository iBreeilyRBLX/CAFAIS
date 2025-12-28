import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommand } from '../interfaces';
import ExtendedClient from '../classes/Client';

export abstract class BaseCommand implements ChatInputCommand {
    public abstract options: SlashCommandBuilder;
    public abstract global: boolean;


    public async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
        this.currentInteraction = interaction;

        try {
            await interaction.deferReply({ ephemeral: this.isEphemeral() });
            await this.executeCommand(client, interaction);
        }
        catch (error) {
            console.error(`Error in command ${this.options.name}:`, {
                userId: interaction.user.id,
                channelId: interaction.channelId,
                error: error instanceof Error ? error.message : String(error),
            });

            const content = 'An error occurred while executing this command.';
            if (interaction.deferred) {
                await interaction.editReply({ content });
            }
            else {
                await interaction.reply({ content, ephemeral: true });
            }
        }
        finally {
            this.currentInteraction = undefined;
        }
    }

    protected abstract executeCommand(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction,
        member?: GuildMember
    ): Promise<void>;

    protected isEphemeral(): boolean {
        return false;
    }

    private currentInteraction?: ChatInputCommandInteraction;
}