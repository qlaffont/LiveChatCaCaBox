import fs from 'fs';
import path from 'path';

// Path validation function from security practices
const isPathSafe = (filePath: string): boolean => {
  const normalizedPath = path.normalize(filePath);
  // Prevent path traversal attacks
  return !normalizedPath.includes('..');
};

export const AdminRoutes = () =>
  async function (fastify: FastifyCustomInstance) {
    /**
     * GET /admin - Serve the admin interface HTML
     */
    fastify.get('/', async function (req, reply) {
      const stream = fs.createReadStream(path.join(__dirname, 'admin.html'));
      reply.type('text/html');
      return stream;
    });

    /**
     * GET /api/media - Get all shared media with metadata
     */
    fastify.get('/api/media', async function (req, reply) {
      try {
        const mediaItems = await prisma.mediaItem.findMany({
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                isOnline: true,
              },
            },
            folder: {
              select: {
                id: true,
                folderPath: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return reply.send({
          success: true,
          data: mediaItems,
        });
      } catch (error) {
        logger.error('Error fetching media items:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch media items',
        });
      }
    });

    /**
     * GET /api/media/:id/stream - Stream a specific media file
     */
    const streamHandler = async function (req, reply) {
      try {
        const { id } = req.params as { id: string };
        console.log('🎬 Stream request for media:', id);

        // Find the media item
        const mediaItem = await prisma.mediaItem.findUnique({
          where: { id },
          include: {
            folder: true,
          },
        });

        if (!mediaItem) {
          return reply.status(404).send({
            success: false,
            error: 'Media not found',
          });
        }

        // Construct the full file path
        const filePath = path.join(mediaItem.folder.folderPath, mediaItem.filename);

        // Security check: validate path
        if (!isPathSafe(filePath)) {
          logger.warn(`Unsafe path detected: ${filePath}`);
          return reply.status(403).send({
            success: false,
            error: 'Invalid file path',
          });
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return reply.status(404).send({
            success: false,
            error: 'File not found on disk',
          });
        }

        // Determine content type
        let contentType = 'application/octet-stream';
        const ext = path.extname(mediaItem.filename).toLowerCase();

        if (mediaItem.fileType === 'image') {
          if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
          else if (ext === '.png') contentType = 'image/png';
          else if (ext === '.gif') contentType = 'image/gif';
          else if (ext === '.webp') contentType = 'image/webp';
          else if (ext === '.bmp') contentType = 'image/bmp';
        } else if (mediaItem.fileType === 'video') {
          if (ext === '.mp4') contentType = 'video/mp4';
          else if (ext === '.webm') contentType = 'video/webm';
          else if (ext === '.mov') contentType = 'video/quicktime'; // Keep quicktime, let browser decide based on URL
          else if (ext === '.avi') contentType = 'video/x-msvideo';
          else if (ext === '.mkv') contentType = 'video/x-matroska';
        }

        // Stream the file
        const stream = fs.createReadStream(filePath);
        reply.type(contentType);
        return stream;
      } catch (error) {
        logger.error('Error streaming media:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to stream media',
        });
      }
    };

    /**
     * GET /api/media/:id/stream - Stream a specific media file
     */
    fastify.get('/api/media/:id/stream', streamHandler);

    /**
     * GET /api/media/:id/stream/:filename - Stream with filename for browser compatibility
     */
    fastify.get('/api/media/:id/stream/:filename', streamHandler);
  };
