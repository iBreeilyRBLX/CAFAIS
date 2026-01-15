import { Events, GuildMember, TextChannel, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from 'discord.js';
import { Event } from '../../interfaces';
import ExtendedClient from '../../classes/Client';
const event: Event = {
    name: Events.GuildMemberAdd,
    execute: async (client: ExtendedClient, member: GuildMember) => {
        const channel = member.guild.channels.cache.get('1458325253381034064') as TextChannel;
        await member.roles.add(`${process.env.UNVERIFIED_ROLE_ID}`);

        // Build the welcome container
        const container = new ContainerBuilder();

        // Title
        const title = new TextDisplayBuilder()
            .setContent(`# Welcome to Cascadian Armed Forces, ${member.user.username}!`);
        container.addTextDisplayComponents(title);

        // Separator
        const separator1 = new SeparatorBuilder({
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        });
        container.addSeparatorComponents(separator1);

        // Description
        const description = new TextDisplayBuilder()
            .setContent(
                `<@${member.user.id}>
                First apply for acces to the server by going to <#1454533143150333994> and clicking the "Verify Now" button below.\n\n` +
                '**How to Apply:**\n' +
                'First pend to the group so you can be accepted in.\n' +
                'Next, fill out the application form linked in the verification channel.\n' +
                'Wait for a staff member to review and accept your application.\n\n' +
                '**After Verification, you\'ll gain access to:**\n' +
                '⁍ **Application Center** - Apply to get into the faction.\n\n' +
                'Need help? Contact <@&1454232274273959957>+ personnel.\n\n',
            );
        container.addTextDisplayComponents(description);

        // // Separator
        // const separator2 = new SeparatorBuilder({
        //     spacing: SeparatorSpacingSize.Small,
        //     divider: true,
        // });
        // container.addSeparatorComponents(separator2);

        // Optionally, you can add a footer or emoji as a TextDisplayBuilder
        // const footer = new TextDisplayBuilder()
        //     .setContent('Always Forward, Never Turning Back. :regional_indicator_a:');
        // container.addTextDisplayComponents(footer);

        try {
            await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
        catch (error) {
            console.error('Failed to send welcome message:', error);
        }
    },
};

export default event;
