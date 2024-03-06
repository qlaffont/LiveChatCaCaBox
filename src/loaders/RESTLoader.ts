import { startCase } from 'lodash';
import { ClientRoutes } from '../components/client/clientRoutes';

export const loadRoutes = (fastify: FastifyCustomInstance) => {
  const routes = [
    {
      '/client': ClientRoutes,
    },
  ];

  for (const route of routes) {
    const [[prefix, fastifyRoutes]] = Object.entries(route);
    //@ts-ignore
    fastify.register(fastifyRoutes(fastify.io), { prefix });
    const routeName = startCase(prefix.substring(1).replaceAll('/', ' '));
    logger.info(`[REST] ${routeName} Routes loaded (${prefix})`);
  }
};
