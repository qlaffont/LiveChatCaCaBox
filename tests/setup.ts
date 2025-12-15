import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';

// Mock global logger to prevent errors
global.logger = {
  info: () => {},
  debug: () => {},
  error: () => {},
  warn: () => {},
  fatal: () => {},
} as any;

// Set up test environment
beforeAll(async () => {
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.API_URL = 'http://localhost:3000';
  process.env.DISCORD_TOKEN = 'test_token';
  process.env.DISCORD_CLIENT_ID = 'test_client_id';
  process.env.NODE_ENV = 'test';
  process.env.LOG = 'silent';

  // Clean up old test database
  if (fs.existsSync('./test.db')) {
    fs.unlinkSync('./test.db');
  }

  // Run migrations for test database
  try {
    execSync('pnpm migration:up', { 
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: 'file:./test.db' }
    });
  } catch (error) {
    console.error('Failed to run migrations:', error);
  }
});

// Clean up after all tests
afterAll(async () => {
  const prisma = new PrismaClient();
  await prisma.$disconnect();
  
  // Clean up test database
  if (fs.existsSync('./test.db')) {
    fs.unlinkSync('./test.db');
  }
});
