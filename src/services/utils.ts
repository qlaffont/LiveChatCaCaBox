import path from 'path';

export const anonymizeId = (id: string | undefined | null) => {
  if (!id) return 'unknown';
  if (id.length <= 8) return id;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
};

export const getMimeType = (filename: string, fileType: 'image' | 'video' | string): string => {
  const ext = path.extname(filename).toLowerCase();

  if (fileType === 'image' || fileType.startsWith('image')) {
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.bmp') return 'image/bmp';
  }

  if (fileType === 'video' || fileType.startsWith('video')) {
    if (ext === '.mp4') return 'video/mp4';
    if (ext === '.webm') return 'video/webm';
    // Treat .mov as mp4 for better browser compatibility (assuming H.264)
    if (ext === '.mov') return 'video/mp4';
    if (ext === '.avi') return 'video/x-msvideo';
    if (ext === '.mkv') return 'video/x-matroska';
  }

  return 'application/octet-stream';
};

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
