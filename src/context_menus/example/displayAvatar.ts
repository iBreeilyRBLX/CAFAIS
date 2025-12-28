/* eslint-disable no-inline-comments */
import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder, GuildMember, Locale } from 'discord.js';
// i18n removed: fallback to plain string
import { UserContextMenu } from '../../interfaces';

// Example user context menu

const contextMenu: UserContextMenu = {
    options: new ContextMenuCommandBuilder()
        .setName('Display Avatar')
        .setType(ApplicationCommandType.User)
        .setDMPermission(false),
    global: true,
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const member = interaction.targetMember as GuildMember,
            embed = new EmbedBuilder()
                .setTitle(`Avatar for ${member.displayName}`)
                .setImage(member.displayAvatarURL({ size:4096 }))
                .setColor(client.config.colors.embed)
                .setFooter({ text:`ID: ${member.id}` })
        interaction.reply({ embeds:[embed] });
    },
};

export default contextMenu;