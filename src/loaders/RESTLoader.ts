import { startCase } from 'lodash';
import path from 'path';
import { ClientRoutes } from '../components/client/clientRoutes';
import { AdminRoutes } from '../components/admin/adminRoutes';

export const loadRoutes = (fastify: FastifyCustomInstance) => {
  // Serve TTS files
  fastify.register(require('@fastify/static'), {
    root: path.join(process.cwd(), 'uploads', 'tts'),
    prefix: '/tts/',
  });

  const routes = [
    {
      '/client': ClientRoutes,
    },
    {
      '/admin': AdminRoutes,
    },
  ];

  for (const route of routes) {
    const [[prefix, fastifyRoutes]] = Object.entries(route);
    //@ts-ignore
    fastify.register(fastifyRoutes(fastify.io), { prefix });
    const routeName = startCase(prefix.substring(1).replaceAll('/', ' '));
    logger.info(`[REST] ${routeName} Routes loaded (${prefix})`);
  }

  // Redirect root to admin
  fastify.get('/', async (req, reply) => {
    return reply.redirect('/admin');
  });
};
