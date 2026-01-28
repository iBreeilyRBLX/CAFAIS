import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';

/**
 * Message ID 5: Training Department
 * Information for Training Officers about their role and responsibilities
 */
export const buildDepartmentContainer = (): ContainerBuilder => {
    const container = new ContainerBuilder()
        .setAccentColor(0xE67E22);

    const title = new TextDisplayBuilder()
        .setContent('## 🛡️ Training Department');
    container.addTextDisplayComponents(title);

    const separator1 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator1);

    const overview = new TextDisplayBuilder()
        .setContent(
            'The Training Department is responsible for training new Initiates to allow them to enter the Cascadian Armed Forces. You will be responsible in managing trainings, in which you will show the basics to the trainee.\n\n' +
            '**⚠️ Important:** This is a skill test - if they don\'t pass, we will have to redo the training.',
        );
    container.addTextDisplayComponents(overview);

    const separator2 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator2);

    const responsibilities = new TextDisplayBuilder()
        .setContent(
            '## 📋 Training Officer Responsibilities\n' +
            '• Use **Hammertime** to schedule trainings in <#1454555912491761875>\n' +
            '• Monitor induction requests in <#1454556030988980446>\n' +
            '• Ensure trainees use Hammertime for time formatting\n' +
            '• If trainee requests training "X time from now" without Hammertime, ask them to use it\n' +
            '• Follow the Training Document guidelines:\n' +
            '  ├ **Orange underlined text** - Instructions for Training Officers\n' +
            '  └ **Yellow underlined text** - What to say to Trainees\n' +
            '• Report document errors to <@471739867332739092>',
        );
    container.addTextDisplayComponents(responsibilities);

    const separator3 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator3);

    const leadership = new TextDisplayBuilder()
        .setContent(
            '## 🎖️ Chain of Command\n' +
            '**👤 Training Academy Chief:** <@471739867332739092>\n\n' +
            '*Currently no additional chain of command established.*',
        );
    container.addTextDisplayComponents(leadership);

    const separator4 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator4);

    const resources = new TextDisplayBuilder()
        .setContent(
            '## 📚 Training Resources\n' +
            '**🎮 Private Server Code:**\n' +
            '```\nba9dc4c8-e66b-4343-ba81-3411626e19b6\n```',
        );
    container.addTextDisplayComponents(resources);

    const separator5 = new SeparatorBuilder({
        spacing: SeparatorSpacingSize.Small,
        divider: true,
    });
    container.addSeparatorComponents(separator5);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Training Document')
                .setStyle(ButtonStyle.Link)
                .setURL('https://docs.google.com/document/d/16Xb03qIZy_eYVmW5_Z88jSKyPTyNleA8LrzZLBzEpas/edit?usp=sharing')
                .setEmoji('📄'),
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('Hammertime')
                .setStyle(ButtonStyle.Link)
                .setURL('https://hammertime.cyou/')
                .setEmoji('⏱️'),
        );
    container.addActionRowComponents(buttonRow);

    return container;
};
