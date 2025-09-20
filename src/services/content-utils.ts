import fs from 'fs';
import fetch from 'node-fetch';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime-types';
import ytdl from '@distube/ytdl-core';

function getFileTypeWithRegex(url) {
  const regex = /(?:\.([^.]+))?$/; // Regular expression to capture file extension
  //@ts-ignore
  const extension = regex.exec(url)[1]; // Extract extension from URL
  return extension ? extension.toLowerCase() : 'No extension found';
}

export const getContentInformationsFromUrl = async (url: string) => {
  let contentType;
  let mediaDuration;
  let mediaIsShort;
  // First try to get it with URL
  try {
    const fileExt = getFileTypeWithRegex(url);

    const tmpContentType = mime.lookup(fileExt);

    if (tmpContentType) {
      contentType = tmpContentType;
    }
  } catch (error) {}

  // If it doesn't work with URL, try with fetch
  try {
    if (!contentType) {
      const file = await fetch(url);

      contentType = file.headers.get('Content-Type');

      if (!contentType) {
        const res = await fileTypeFromBuffer(await file.arrayBuffer());

        if (res) {
          contentType = res.mime;
        }
      }
    }
  } catch (error) {}

  try {
    mediaDuration = await getVideoDurationInSeconds(url, 'ffprobe');
  } catch (error) {}

  //if it is a youtube video, get the duration from the url
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let agent;

    //if file exist on root of app, use it
    if (fs.existsSync(env.YTDL_COOKIE_PATH)) {
      agent = ytdl.createAgent(JSON.parse(fs.readFileSync(env.YTDL_COOKIE_PATH, 'utf8')));
    }
    const info = await ytdl.getInfo(url, { agent });
    mediaDuration = info.videoDetails.lengthSeconds;
    mediaIsShort = info.videoDetails.isCrawlable;
    contentType = 'video/mp4';
  }

  return { contentType, mediaDuration, mediaIsShort };
};
