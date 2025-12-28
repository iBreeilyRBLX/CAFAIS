import { getPingButton } from '../../../features/ping';
// i18n removed: fallback to plain string
import { Button } from '../../../interfaces';

// Example interaction (related to the /ping command)

const button: Button = {
    name: 'ping',
    execute: async (_client, interaction) => {
        interaction.reply({ content: `Pong! 🏓`, components: [getPingButton()], ephemeral: true });
    },
};

export default button;