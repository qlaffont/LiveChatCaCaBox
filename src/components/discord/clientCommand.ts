import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const clientCommand = () => ({
  data: new SlashCommandBuilder()
    .setName(rosetty.t('clientCommand')!)
    .setDescription(rosetty.t('clientCommandDescription')!),
  handler: async (interaction: CommandInteraction) => {
    const link = env.API_URL + '/client?guildId=' + interaction.guildId;

    await interaction.reply({
      embeds: [new EmbedBuilder().setDescription(rosetty.t('clientCommandsAnswer', { link })!)],
    });
  },
});
