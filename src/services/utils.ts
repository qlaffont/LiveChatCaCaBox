export const getDurationFromGuildId = async (duration: number | undefined | null, guildId: string) => {
  const guild = await prisma.guild.findFirst({
    where: {
      id: guildId,
    },
  });

  const mediaDurationTime = duration ?? guild?.defaultMediaTime ?? env.DEFAULT_DURATION;

  return !!guild?.maxMediaTime && mediaDurationTime > guild?.maxMediaTime ? guild?.maxMediaTime : mediaDurationTime;
};

export const getDisplayMediaFullFromGuildId = async (guildId: string) => {
  const guild = await prisma.guild.findFirst({
    where: {
      id: guildId,
    },
  });

  return !!guild?.displayMediaFull || false;
};
