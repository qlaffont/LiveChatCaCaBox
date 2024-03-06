import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const infoCommand = () => ({
  data: new SlashCommandBuilder().setName('info').setDescription('Bot Informations'),
  handler: async (interaction: CommandInteraction) => {
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setTitle(`Developed by Quentin Laffont - ${new Date().getFullYear()}`).setDescription(`
          [LeStudio - Broadcast Software](https://lestudio.qlaffont.com)
          [GitHub](https://github.com/qlaffont)
          [Personal Website](https://qlaffont.com)
          `),
      ],
      ephemeral: true,
    });
  },
});
