import { join } from 'path';

import { unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import gTTS from 'gtts';

export const promisedGtts = (voice, lang) =>
  new Promise<string>((resolve, reject) => {
    const gtts = new gTTS(voice, lang);

    const filePath = join(__dirname, `${Date.now()}-${Math.ceil(Math.random() * 100)}.mp3`);

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
