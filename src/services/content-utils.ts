import fs from 'fs';
import fetch from 'node-fetch';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime-types';
import { Innertube } from 'youtubei.js';
import { env } from './env';

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
    try {
      // Create Innertube instance with optional cookie data
      const options: any = {};
      
      //if file exist on root of app, use it
      if (fs.existsSync(env.YTDL_COOKIE_PATH)) {
        const cookieData = JSON.parse(fs.readFileSync(env.YTDL_COOKIE_PATH, 'utf8'));
        options.cookie = cookieData;
      }
      
      const innertube = await Innertube.create(options);
      const info = await innertube.getInfo(url);
      
      // Get duration from basic_info
      if (info.basic_info?.duration) {
        mediaDuration = info.basic_info.duration;
      }
      
      // Check if it's crawlable (similar to isCrawlable)
      mediaIsShort = info.basic_info?.is_crawlable ?? true;
      contentType = 'video/mp4';
    } catch (error) {
      console.error('Error getting YouTube video info:', error);
    }
  }

  return { contentType, mediaDuration, mediaIsShort };
};
