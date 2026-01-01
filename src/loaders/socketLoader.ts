import path from 'path';
import { scanMediaFolder } from '../services/media-scanner';
import { QueueType } from '../services/prisma/loadPrisma';
import { getDurationFromGuildId, getDisplayMediaFullFromGuildId, getMimeType, anonymizeId } from '../services/utils';

const DEFAULT_AVATAR_URL = 'https://cdn.discordapp.com/embed/avatars/0.png';

// Track connected admin users
const connectedUsers = new Map<string, string>(); // userId -> socketId

export const loadSocket = (fastify: FastifyCustomInstance) => {
  logger.info(`[Socket] Socket loaded`);
  fastify.io.on('connection', (socket) => {
    logger.debug(`New connection to socketIO :  ${socket.id}`);

    socket.on('disconnecting', async () => {
      logger.debug(`New disconnection to socketIO :  ${socket.id}`);

      // Check if this was an admin user
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        connectedUsers.delete(disconnectedUserId);

        // Update user status in database
        await prisma.user.update({
          where: { id: disconnectedUserId },
          data: {
            isOnline: false,
            lastSeen: new Date(),
            socketId: null,
          },
        });

        // Notify other admin users
        socket.to('admin-room').emit('admin:user-offline', {
          userId: disconnectedUserId,
        });

        logger.info(`Admin user ${disconnectedUserId} disconnected`);
      }
    });

    socket.on('join-room', (id) => {
      logger.info(`🔗 Socket ${socket.id} joining room: ${id}`);
      socket.join(id);
    });

    socket.on('ping', () => {
      fastify.io.to(socket.id).emit('ping', 'pong');
    });

    // ===== ADMIN EVENTS =====

    /**
     * Register a new admin user
     */
    socket.on('admin:register', async (data: { userId?: string; username: string }) => {
      try {
        const { userId, username } = data;

        // Upsert user in database
        const user = await prisma.user.upsert({
          where: userId ? { id: userId } : { username },
          create: {
            username,
            socketId: socket.id,
            isOnline: true,
          },
          update: {
            socketId: socket.id,
            isOnline: true,
            lastSeen: new Date(),
          },
        });

        // Add to connected users map
        connectedUsers.set(user.id, socket.id);

        // Join admin room
        socket.join('admin-room');

        // Send back user info
        socket.emit('admin:registered', {
          userId: user.id,
          username: user.username,
        });

        // Notify other users
        socket.to('admin-room').emit('admin:user-online', {
          userId: user.id,
          username: user.username,
        });

        logger.info(`Admin user ${username} registered with ID ${user.id}`);
      } catch (error) {
        logger.error('Error registering admin user:', error);
        socket.emit('admin:error', {
          message: 'Failed to register user',
        });
      }
    });

    /**
     * Scan a folder and add media to shared library
     */
    socket.on('admin:scan-folder', async (data: { userId: string; folderPath: string }) => {
      try {
        const { userId, folderPath } = data;

        logger.info(`Scanning folder ${folderPath} for user ${userId}`);

        // Scan the folder
        const mediaItems = await scanMediaFolder(folderPath);

        // Check if folder already exists for this user
        let folder = await prisma.mediaFolder.findFirst({
          where: {
            userId,
            folderPath,
          },
          include: {
            mediaItems: {
              select: {
                filename: true,
              },
            },
          },
        });

        if (!folder) {
          // Create new folder
          folder = await prisma.mediaFolder.create({
            data: {
              userId,
              folderPath,
              isActive: true,
            },
            include: {
              mediaItems: {
                select: {
                  filename: true,
                },
              },
            },
          });
        }

        // Get list of existing filenames
        const existingFilenames = new Set(folder.mediaItems.map((item) => item.filename));

        // Filter out items that already exist
        const newMediaItems = mediaItems.filter((item) => !existingFilenames.has(item.filename));

        if (newMediaItems.length === 0) {
          logger.info(`No new media items found in ${folderPath}`);
          socket.emit('admin:scan-complete', {
            folderId: folder.id,
            mediaCount: 0,
          });
          return;
        }

        // Create new media items in database
        const createdItems = await Promise.all(
          newMediaItems.map((item) =>
            prisma.mediaItem.create({
              data: {
                folderId: folder!.id,
                userId,
                filename: item.filename,
                fileType: item.fileType,
                fileSize: item.fileSize,
                duration: item.duration,
                thumbnailUrl: item.thumbnailUrl,
                metadata: JSON.stringify({ filePath: item.filePath }),
              },
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
            }),
          ),
        );

        // Notify the scanner
        socket.emit('admin:scan-complete', {
          folderId: folder.id,
          mediaCount: createdItems.length,
        });

        // Broadcast new media to all admin users
        socket.to('admin-room').emit('admin:media-added', {
          media: createdItems,
        });

        logger.info(`Added ${createdItems.length} media items from ${folderPath}`);
      } catch (error) {
        logger.error('Error scanning folder:', error);
        socket.emit('admin:error', {
          message: 'Failed to scan folder',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    /**
     * Play a media item (add to queue)
     */
    socket.on(
      'admin:play-media',
      async (data: { mediaId: string; requesterId: string; guildId: string; displayFull?: boolean; text?: string; layout?: any }) => {
        try {
          const { mediaId, requesterId, guildId, displayFull, text, layout } = data;

          // Find the media item
          const mediaItem = await prisma.mediaItem.findUnique({
            where: { id: mediaId },
            include: {
              owner: true,
              folder: true,
            },
          });

          if (!mediaItem) {
            socket.emit('admin:error', {
              message: 'Media not found',
            });
            return;
          }

          // Find the requester (user playing the media)
          const requester = await prisma.user.findUnique({
            where: { id: requesterId },
          });

          // Play directly - construct local URL
          // Use filename in URL for better browser compatibility
          // Trick: for .mov, use .mp4 extension in URL to help browser sniffing
          const safeFilename = mediaItem.filename.endsWith('.mov')
            ? mediaItem.filename.replace('.mov', '.mp4')
            : mediaItem.filename;

          const mediaUrl = `${env.API_URL}/admin/api/media/${mediaId}/stream/${encodeURIComponent(safeFilename)}`;

          // Add to queue
          await prisma.queue.create({
            data: {
              content: JSON.stringify({
                url: null,
                text: text || null,
                media: mediaUrl,
                mediaContentType: getMimeType(mediaItem.filename, mediaItem.fileType),
                mediaDuration: await getDurationFromGuildId(
                  mediaItem.duration ? Math.ceil(mediaItem.duration) : undefined,
                  guildId,
                ),
                displayFull: displayFull ?? (await getDisplayMediaFullFromGuildId(guildId)),
                mediaIsShort: false,
                layout: layout || null,
              }),
              type: QueueType.MESSAGE,
              author: requester ? requester.username : mediaItem.owner.username,
              authorImage: DEFAULT_AVATAR_URL,
              discordGuildId: guildId,
              duration: await getDurationFromGuildId(
                mediaItem.duration ? Math.ceil(mediaItem.duration) : undefined,
                guildId,
              ),
            },
          });

          socket.emit('admin:play-success', {
            mediaId,
          });

          logger.info(`📺 Media ${mediaId} added to queue for guild: ${anonymizeId(guildId)}, will be sent to room: messages-${anonymizeId(guildId)}`);
        } catch (error) {
          logger.error('Error playing media:', error);
          socket.emit('admin:error', {
            message: 'Failed to play media',
          });
        }
      },
    );

    /**
     * Owner responds with stream URL
     */
    socket.on(
      'admin:stream-response',
      async (data: { mediaId: string; requesterId: string; guildId: string; streamUrl: string }) => {
        try {
          const { mediaId, requesterId, guildId, streamUrl } = data;

          // Find the media item for metadata
          const mediaItem = await prisma.mediaItem.findUnique({
            where: { id: mediaId },
            include: {
              owner: true,
            },
          });

          if (!mediaItem) {
            return;
          }

          // Add to queue with stream URL
          await prisma.queue.create({
            data: {
              content: JSON.stringify({
                url: null,
                text: null,
                media: streamUrl,
                mediaContentType: getMimeType(mediaItem.filename, mediaItem.fileType),
                mediaDuration: await getDurationFromGuildId(
                  mediaItem.duration ? Math.ceil(mediaItem.duration) : undefined,
                  guildId,
                ),
                displayFull: await getDisplayMediaFullFromGuildId(guildId),
                mediaIsShort: false,
              }),
              type: QueueType.MESSAGE,
              author: mediaItem.owner.username,
              authorImage: DEFAULT_AVATAR_URL,
              discordGuildId: guildId,
              duration: await getDurationFromGuildId(
                mediaItem.duration ? Math.ceil(mediaItem.duration) : undefined,
                guildId,
              ),
            },
          });

          // Notify requester
          const requesterSocketId = connectedUsers.get(requesterId);
          if (requesterSocketId) {
            fastify.io.to(requesterSocketId).emit('admin:play-success', {
              mediaId,
            });
          }

          logger.info(`Media ${mediaId} added to queue via stream from owner`);
        } catch (error) {
          logger.error('Error processing stream response:', error);
        }
      },
    );

    /**
     * Send a text/media message (like /msg command)
     */
    socket.on(
      'admin:send-message',
      async (data: { userId: string; guildId: string; text?: string; url?: string; mediaId?: string }) => {
        try {
          const { userId, guildId, text, url } = data;

          // Get user info
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user) {
            socket.emit('admin:error', {
              message: 'User not found',
            });
            return;
          }

          // Create queue entry
          await prisma.queue.create({
            data: {
              content: JSON.stringify({
                url: url || null,
                text: text || null,
                media: null,
                mediaContentType: null,
                mediaDuration: await getDurationFromGuildId(undefined, guildId),
                displayFull: await getDisplayMediaFullFromGuildId(guildId),
                mediaIsShort: false,
              }),
              type: QueueType.MESSAGE,
              author: user.username,
              authorImage: DEFAULT_AVATAR_URL,
              discordGuildId: guildId,
              duration: await getDurationFromGuildId(undefined, guildId),
            },
          });

          socket.emit('admin:message-sent', {
            success: true,
          });

          logger.info(`Message sent by admin user ${user.username}`);
        } catch (error) {
          logger.error('Error sending message:', error);
          socket.emit('admin:error', {
            message: 'Failed to send message',
          });
        }
      },
    );

    /**
     * Text-to-speech (like /dire command)
     */
    socket.on('admin:speak', async (data: { userId: string; guildId: string; text: string; voice?: string }) => {
      try {
        const { userId, guildId, text, voice } = data;

        // Get user info
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          socket.emit('admin:error', {
            message: 'User not found',
          });
          return;
        }

        // Import TTS module
        const gtts = await import('../services/gtts');
        const { getContentInformationsFromUrl } = await import('../services/content-utils');

        // Generate TTS file (saves to disk temporarily)
        const filePath = await gtts.promisedGtts(text, voice || 'fr');

        // Create a public URL for the audio file
        const audioUrl = `${env.API_URL}/tts/${path.basename(filePath)}`;

        // Get audio duration
        const contentInfo = await getContentInformationsFromUrl(filePath);

        // Create queue entry
        await prisma.queue.create({
          data: {
            content: JSON.stringify({
              url: audioUrl,
              text,
              media: audioUrl,
              mediaContentType: 'audio/mpeg',
              mediaDuration: contentInfo.mediaDuration
                ? Math.ceil(contentInfo.mediaDuration)
                : await getDurationFromGuildId(undefined, guildId),
              displayFull: false,
              mediaIsShort: false,
            }),
            type: QueueType.VOCAL,
            author: user.username,
            authorImage: DEFAULT_AVATAR_URL,
            discordGuildId: guildId,
            duration: await getDurationFromGuildId(
              contentInfo.mediaDuration ? Math.ceil(contentInfo.mediaDuration) : undefined,
              guildId,
            ),
          },
        });

        socket.emit('admin:speak-success', {
          success: true,
        });

        logger.info(`TTS generated by admin user ${user.username}`);
      } catch (error) {
        logger.error('Error generating TTS:', error);
        socket.emit('admin:error', {
          message: 'Failed to generate speech',
        });
      }
    });

    /**
     * Stop current media
     */
    socket.on('admin:stop', async (data: { guildId: string }) => {
      try {
        const { guildId } = data;

        // Emit stop to the messages room
        fastify.io.to(`messages-${guildId}`).emit('stop');

        // Reset guild busy status
        await prisma.guild.update({
          where: { id: guildId },
          data: { busyUntil: null },
        });

        socket.emit('admin:stop-success', {
          success: true,
        });

        logger.info(`Stop command issued for guild ${guildId}`);
      } catch (error) {
        logger.error('Error stopping media:', error);
        socket.emit('admin:error', {
          message: 'Failed to stop media',
        });
      }
    });
  });
};
