import { join } from 'path';

import { mkdir, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import gTTS from 'gtts';

export const promisedGtts = (voice, lang) =>
  new Promise<string>(async (resolve, reject) => {
    const gtts = new gTTS(voice, lang);

    const uploadsDir = join(process.cwd(), 'uploads', 'tts');
    await mkdir(uploadsDir, { recursive: true });

    const filePath = join(uploadsDir, `${Date.now()}-${Math.ceil(Math.random() * 100)}.mp3`);

    gtts.save(filePath, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(filePath);
    });
  });

export const readGttsAsStream = (filePath) => {
  return createReadStream(filePath);
};

export const deleteGtts = async (filePath) => {
  await unlink(filePath);
};
