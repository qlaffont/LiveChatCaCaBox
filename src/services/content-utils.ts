import fetch from 'node-fetch';
import { Innertube } from 'youtubei.js';
import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime-types';

function getFileTypeWithRegex(url) {
  const regex = /(?:\.([^.]+))?$/; // Regular expression to capture file extension
  //@ts-ignore
  const extension = regex.exec(url)[1]; // Extract extension from URL
  return extension ? extension.toLowerCase() : 'No extension found';
}

function getTikTokId(url: string) {
  const regex =
    /\bhttps?:\/\/(?:m|www|vm)\.tiktok\.com\/(?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+)|([^\/]+))/gm;
  const match = regex.exec(url);
  return match ? match[1] || match[2] : null;
}

export const getContentInformationsFromUrl = async (url: string) => {
  let contentType;
  let mediaDuration;
  let mediaIsShort;

  // Check for TikTok
  if (url.includes('tiktok.com')) {
    const tiktokId = getTikTokId(url);
    if (tiktokId) {
      contentType = 'embed/tiktok';
      mediaIsShort = true;
      
      // Essai de récupération oEmbed (optionnel, pour validation) ou juste hardcode
      // TikTok ne donne pas la durée via oEmbed simplement.
      // On va logger pour debug
      console.log('TikTok ID detected:', tiktokId);

      mediaDuration = 20; // Réduit à 20s par défaut pour éviter le "trop long"
      // TODO: Idéalement, il faudrait une vraie API pour la durée.
      
      return { contentType, mediaDuration, mediaIsShort };
    }
  }

  // Check for YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    try {
      console.log('Resolving YouTube URL:', url);
      const youtube = await Innertube.create();
      const videoId = (await youtube.resolveURL(url)).payload.videoId;
      console.log('YouTube Video ID:', videoId);
      
      if (videoId) {
        const info = await youtube.getBasicInfo(videoId);
        console.log('YouTube Info Duration:', info.basic_info.duration);
        console.log('YouTube Info IsShort:', info.basic_info.is_short);
        
        contentType = 'video/youtube';
        mediaDuration = info.basic_info.duration || 0;
        //@ts-ignore
        mediaIsShort = info.basic_info.is_short;
        
        if (mediaIsShort === undefined && url.includes('/shorts/')) {
          mediaIsShort = true;
        }
        
        return { contentType, mediaDuration, mediaIsShort };
      }
    } catch (error) {
      console.error('Error fetching YouTube info:', error);
    }
  }

  // Fallback to original logic for other files
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

  // Try retrieving duration via standard means if not found yet (for raw files)
  if (!mediaDuration) {
     /* Note: getVideoDurationInSeconds removed as it was unreliable or problematic in original code context for streams, 
        and we are focusing on YouTube/TikTok primarily. 
        Re-adding simple fallback if needed, but the library 'get-video-duration' requires ffprobe.
     */
     // On laisse vide, le frontend gérera ou on pourrait remettre l'ancien code si nécessaire pour les fichiers raw.
  }

  return { contentType, mediaDuration, mediaIsShort };
};
