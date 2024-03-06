import fs from 'fs';
import { join } from 'path';

export const ClientRoutes = () =>
  async function (fastify: FastifyCustomInstance) {
    fastify.get('/', async function (req, reply) {
      const stream = fs.createReadStream(join(__dirname, 'client.html'));

      reply.type('text/html');
      return stream;
    });
  };
