import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { scanMediaFolder, generateImageThumbnail, generateVideoThumbnail } from '../../src/services/media-scanner';
import fs from 'fs';
import path from 'path';

describe('Media Scanner Service', () => {
  const testDir = path.join(__dirname, '../temp-test-media');

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Create a dummy text file (will be skipped)
    fs.writeFileSync(path.join(testDir, 'test.txt'), 'test content');
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('scanMediaFolder', () => {
    it('should scan an existing folder without errors', async () => {
      const result = await scanMediaFolder(testDir);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for folder with no media files', async () => {
      const result = await scanMediaFolder(testDir);
      // Only .txt file exists, so should return empty
      expect(result).toHaveLength(0);
    });

    it('should throw error for non-existent folder', async () => {
      await expect(scanMediaFolder('/non/existent/path')).rejects.toThrow();
    });
  });

  describe('generateVideoThumbnail', () => {
    it('should generate a placeholder thumbnail', async () => {
      const thumbnail = await generateVideoThumbnail();
      expect(thumbnail).toBeDefined();
      expect(thumbnail).toContain('data:image/svg+xml;base64');
    });
  });
});
