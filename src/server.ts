/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import Fastify from 'fastify';
import FastifyCORS from '@fastify/cors';
import GracefulServer from '@gquittet/graceful-server';
import unifyFastifyPlugin from 'unify-fastify';
import { loadRoutes } from './loaders/RESTLoader';
import { loadSocket } from './loaders/socketLoader';
import { isProductionEnv, isPreProductionEnv } from './services/env';
import { loadDiscord } from './loaders/DiscordLoader';
import { loadRosetty } from './services/i18n/loader';
import { loadPrismaClient } from './services/prisma/loadPrisma';

export const runServer = async () => {
  const logLevel = env.LOG || 'info';
  // LOAD API FRAMEWORK
  //@ts-ignore
  const fastify: FastifyCustomInstance = Fastify({
    logger: { level: logLevel },
    disableRequestLogging: true,
  });

  const logger = fastify.log;
  global.logger = logger;

  await fastify.register(unifyFastifyPlugin, {
    disableDetails: isProductionEnv() || isPreProductionEnv(),
  });

  //LOAD SENDIM
  const gracefulServer = GracefulServer(fastify.server);
  gracefulServer.on(GracefulServer.SHUTTING_DOWN, (err) => {
    if (err) {
      logger.debug(err);
    }
    logger.debug('Server is shutting down');
  });

  try {
    logger.info('[DB] Connected to database');
    await loadPrismaClient();
  } catch (e) {
    logger.fatal('[DB] Impossible to connect to database', e as Record<string, unknown>);
    console.error('DATABASE_URL:', process.env.DATABASE_URL); // Debug
    process.exit(1);
  }

  try {
    await fastify.register(require('fastify-socket.io'), {
      cors: {
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'forest-context-url',
          'Set-Cookie',
          'set-cookie',
          'Cookie',
        ],
        origin: true,
        credentials: true,
      },
    });

    fastify.addHook('onClose', async (err) => {
      if (err) {
        logger.debug(err);
      }
      await global.prisma.$disconnect();
      await fastify.io.close();
      logger.debug('Server is shutting down');
    });
  } catch (error) {
    logger.fatal('Impossible to disconnect to db');
  }

  // SERVER CONFIGURATION
  await fastify.register(FastifyCORS, {
    methods: ['GET', 'PUT', 'DELETE', 'POST', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'forest-context-url',
      'Set-Cookie',
      'set-cookie',
      'Cookie',
    ],
    origin: true,
    credentials: true,
  });

  loadRosetty();
  await loadSocket(fastify);
  await loadRoutes(fastify);
  await loadDiscord(fastify);
  gracefulServer.setReady();

  return fastify;
};
