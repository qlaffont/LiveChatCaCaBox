import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

describe('Admin Routes', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Database Models', () => {
    it('should have User model available', () => {
      expect(prisma.user).toBeDefined();
    });

    it('should have MediaFolder model available', () => {
      expect(prisma.mediaFolder).toBeDefined();
    });

    it('should have MediaItem model available', () => {
      expect(prisma.mediaItem).toBeDefined();
    });
  });

  describe('User Model Operations', () => {
    it('should create a new user', async () => {
      const user = await prisma.user.create({
        data: {
          username: `test-user-${Date.now()}`,
          isOnline: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toContain('test-user-');
      expect(user.isOnline).toBe(true);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should enforce unique username constraint', async () => {
      const username = `unique-user-${Date.now()}`;
      
      const user1 = await prisma.user.create({
        data: { username },
      });

      // Attempting to create duplicate should fail
      await expect(
        prisma.user.create({
          data: { username },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.user.delete({ where: { id: user1.id } });
    });
  });

  describe('MediaFolder and MediaItem Operations', () => {
    it('should create a media folder for a user', async () => {
      const user = await prisma.user.create({
        data: { username: `folder-test-${Date.now()}` },
      });

      const folder = await prisma.mediaFolder.create({
        data: {
          userId: user.id,
          folderPath: '/test/path',
          isActive: true,
        },
      });

      expect(folder).toBeDefined();
      expect(folder.userId).toBe(user.id);
      expect(folder.folderPath).toBe('/test/path');

      // Clean up
      await prisma.mediaFolder.delete({ where: { id: folder.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should create a media item linked to folder and user', async () => {
      const user = await prisma.user.create({
        data: { username: `media-test-${Date.now()}` },
      });

      const folder = await prisma.mediaFolder.create({
        data: {
          userId: user.id,
          folderPath: '/test/media',
        },
      });

      const mediaItem = await prisma.mediaItem.create({
        data: {
          folderId: folder.id,
          userId: user.id,
          filename: 'test.jpg',
          fileType: 'image',
          fileSize: 1024,
          thumbnailUrl: 'data:image/jpeg;base64,test',
        },
      });

      expect(mediaItem).toBeDefined();
      expect(mediaItem.filename).toBe('test.jpg');
      expect(mediaItem.fileType).toBe('image');
      expect(mediaItem.fileSize).toBe(1024);

      // Clean up
      await prisma.mediaItem.delete({ where: { id: mediaItem.id } });
      await prisma.mediaFolder.delete({ where: { id: folder.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should cascade delete media items when folder is deleted', async () => {
      const user = await prisma.user.create({
        data: { username: `cascade-test-${Date.now()}` },
      });

      const folder = await prisma.mediaFolder.create({
        data: {
          userId: user.id,
          folderPath: '/test/cascade',
        },
      });

      const mediaItem = await prisma.mediaItem.create({
        data: {
          folderId: folder.id,
          userId: user.id,
          filename: 'cascade-test.jpg',
          fileType: 'image',
          fileSize: 2048,
        },
      });

      // Delete folder should cascade to media items
      await prisma.mediaFolder.delete({ where: { id: folder.id } });

      // MediaItem should no longer exist
      const deletedItem = await prisma.mediaItem.findUnique({
        where: { id: mediaItem.id },
      });
      expect(deletedItem).toBeNull();

      // Clean up user
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});
