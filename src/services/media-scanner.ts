import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getVideoDurationInSeconds } from 'get-video-duration';

// Supported media extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

interface MediaItemData {
  filename: string;
  fileType: 'image' | 'video';
  fileSize: number;
  duration?: number;
  thumbnailUrl: string;
  filePath: string;
}

/**
 * Generate a thumbnail for an image file
 * @param filePath Full path to the image file
 * @returns Base64 encoded JPEG thumbnail
 */
export const generateImageThumbnail = async (filePath: string): Promise<string> => {
  try {
    const buffer = await sharp(filePath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    logger.error(`Failed to generate thumbnail for ${filePath}:`, error);
    return generatePlaceholderThumbnail('image');
  }
};

/**
 * Generate a placeholder thumbnail for video files
 * @returns Base64 encoded SVG placeholder
 */
export const generateVideoThumbnail = async (): Promise<string> => {
  // For MVP, return a placeholder
  // Future: Use ffmpeg to extract frame
  return generatePlaceholderThumbnail('video');
};

/**
 * Generate a placeholder SVG thumbnail
 * @param type Type of media (image or video)
 * @returns Base64 encoded SVG
 */
const generatePlaceholderThumbnail = (type: 'image' | 'video'): string => {
  const icon = type === 'video' ? '▶' : '🖼';
  const color = type === 'video' ? '#3b82f6' : '#10b981';

  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${color}"/>
    <text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

/**
 * Get the duration of a video file in seconds
 * @param filePath Full path to the video file
 * @returns Duration in seconds or undefined if unable to determine
 */
const getVideoDuration = async (filePath: string): Promise<number | undefined> => {
  try {
    const duration = await getVideoDurationInSeconds(filePath);
    return duration;
  } catch (error) {
    logger.debug(`Could not determine video duration for ${filePath}`);
    return undefined;
  }
};

/**
 * Scan a folder for media files and generate metadata
 * @param folderPath Absolute path to the folder to scan
 * @returns Array of media item data
 */
export const scanMediaFolder = async (folderPath: string): Promise<MediaItemData[]> => {
  const mediaItems: MediaItemData[] = [];

  try {
    // Verify folder exists
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder does not exist: ${folderPath}`);
    }

    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${folderPath}`);
    }

    // Read directory contents
    const files = fs.readdirSync(folderPath);

    for (const filename of files) {
      const filePath = path.join(folderPath, filename);

      // Skip if not a file
      const fileStats = fs.statSync(filePath);
      if (!fileStats.isFile()) {
        continue;
      }

      // Get file extension
      const ext = path.extname(filename).toLowerCase();

      // Determine file type
      let fileType: 'image' | 'video' | null = null;
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileType = 'image';
      } else if (VIDEO_EXTENSIONS.includes(ext)) {
        fileType = 'video';
      }

      // Skip unsupported files
      if (!fileType) {
        continue;
      }

      // Generate thumbnail
      let thumbnailUrl: string;
      if (fileType === 'image') {
        thumbnailUrl = await generateImageThumbnail(filePath);
      } else {
        thumbnailUrl = await generateVideoThumbnail();
      }

      // Get duration for videos
      let duration: number | undefined;
      if (fileType === 'video') {
        duration = await getVideoDuration(filePath);
      }

      mediaItems.push({
        filename,
        fileType,
        fileSize: fileStats.size,
        duration,
        thumbnailUrl,
        filePath,
      });

      logger.debug(`Scanned media: ${filename} (${fileType})`);
    }

    logger.info(`Scanned ${mediaItems.length} media files from ${folderPath}`);
    return mediaItems;
  } catch (error) {
    logger.error(`Error scanning folder ${folderPath}:`, error);
    throw error;
  }
};
