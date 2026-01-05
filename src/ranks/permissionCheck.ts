import { ChatInputCommandInteraction, CommandInteraction, GuildMember } from 'discord.js';
import { hasCommandPermission } from '../ranks/permissions';

type AnyCommandInteraction = CommandInteraction | ChatInputCommandInteraction;

export async function checkAndReplyPerms(interaction: AnyCommandInteraction, commandName: string): Promise<boolean> {
    const member = interaction.member as GuildMember;

    if (await hasCommandPermission(member, commandName)) {
        return true;
    }

    const replyPayload = { content: 'You do not have permission to use this command.', ephemeral: true } as const;

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(replyPayload);
        }
        else {
            await interaction.reply(replyPayload);
        }
    }
    catch (error) {
        // Fallback if interaction state changed unexpectedly
        try {
            await interaction.followUp(replyPayload);
        }
        catch (followUpError) {
            console.error('Failed to send permission denial response:', followUpError);
        }
    }

    return false;
}
