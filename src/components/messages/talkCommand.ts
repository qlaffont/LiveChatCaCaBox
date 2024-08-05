import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { QueueType } from '../../services/prisma/loadPrisma';
import { getContentInformationsFromUrl } from '../../services/content-utils';
import { deleteGtts, promisedGtts, readGttsAsStream } from '../../services/gtts';
import { getDurationFromGuildId } from '../../services/utils';

export const talkCommand = () => ({
  data: new SlashCommandBuilder()
    .setName(rosetty.t('talkCommand')!)
    .setDescription(rosetty.t('talkCommandDescription')!)
    .addStringOption((option) =>
      option
        .setName(rosetty.t('talkCommandOptionVoice')!)
        .setDescription(rosetty.t('talkCommandOptionVoiceDescription')!)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName(rosetty.t('talkCommandOptionText')!)
        .setDescription(rosetty.t('talkCommandOptionTextDescription')!),
    ),
  handler: async (interaction: CommandInteraction) => {
    const text = interaction.options.get(rosetty.t('talkCommandOptionText')!)?.value;
    const voice = interaction.options.get(rosetty.t('talkCommandOptionVoice')!)?.value;

    const filePath = await promisedGtts(voice, rosetty.getCurrentLang());

    const fileStream = readGttsAsStream(filePath);

    const interactionReply = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(rosetty.t('success')!)
          .setDescription(rosetty.t('talkCommandAnswer')!)
          .setColor(0x2ecc71),
      ],
      files: [fileStream],
    });

    const message = await interactionReply.fetch();
    const media = message.attachments.first()?.proxyURL;

    const additionalContent = await getContentInformationsFromUrl(media as string);

    await deleteGtts(filePath);

    await prisma.queue.create({
      data: {
        content: JSON.stringify({
          text,
          media,
          mediaContentType: 'audio/mpeg',
          mediaDuration: Math.ceil(additionalContent.mediaDuration),
        }),
        type: QueueType.VOCAL,
        discordGuildId: interaction.guildId!,
        duration: await getDurationFromGuildId(
          additionalContent.mediaDuration ? Math.ceil(additionalContent.mediaDuration) : undefined,
          interaction.guildId!,
        ),
        author: interaction.user.username,
        authorImage: interaction.user.avatarURL(),
      },
    });
  },
});
