import { CommandInteraction, GuildMember } from 'discord.js';
import { hasCommandPermission } from '../ranks/permissions';

export async function checkAndReplyPerms(interaction: CommandInteraction, commandName: string): Promise<boolean> {
  const member = interaction.member as GuildMember;
  if (!(await hasCommandPermission(member, commandName))) {
    await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    return false;
  }
  return true;
}
