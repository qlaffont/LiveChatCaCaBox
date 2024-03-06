import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { startCase } from 'lodash';

export const aliveCommand = () => ({
  data: new SlashCommandBuilder()
    .setName(rosetty.t('aliveCommand')!)
    .setDescription(rosetty.t('aliveCommandDescription')!),
  handler: async (interaction: CommandInteraction) => {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(rosetty.t('aliveCommandsAnswer', { username: startCase(interaction.user.username)! })!)
          .setColor(0x2ecc71),
      ],
    });
  },
});
