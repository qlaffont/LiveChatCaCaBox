import { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const setDisplayMediaFullCommand = () => ({
  data: new SlashCommandBuilder()
    .setName(rosetty.t('setDisplayMediaFullCommand')!)
    .setDescription(rosetty.t('setDisplayMediaFullCommandDescription')!)
    .addBooleanOption((option) =>
      option
        .setName(rosetty.t('setDisplayMediaFullCommandOptionText')!)
        .setDescription(rosetty.t('setDisplayMediaFullCommandOptionTextDescription')!)
        .setRequired(true),
    ),
  handler: async (interaction: CommandInteraction, discordClient: Client) => {
    const value = interaction.options.get(rosetty.t('setDisplayMediaFullCommandOptionText')!)?.value as boolean;

    const userId = interaction.user.id;
    const guildMember = await discordClient.guilds
      .fetch(interaction.guildId!)
      .then((guild) => guild.members.fetch(userId!));

    if (!guildMember.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setTitle(rosetty.t('notAllowed')!).setColor(0xe74c3c)],
        ephemeral: true,
      });

      return;
    }

    await prisma.guild.upsert({
      where: {
        id: interaction.guildId!,
      },
      create: {
        id: interaction.guildId!,
        displayMediaFull: value,
      },
      update: {
        displayMediaFull: value,
      },
    });

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(rosetty.t('success')!)
          .setDescription(rosetty.t('setDisplayMediaFullCommandAnswer')!)
          .setColor(0x2ecc71),
      ],
      ephemeral: true,
    });
  },
});
