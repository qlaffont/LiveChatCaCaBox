import fs from 'fs';
import { join } from 'path';

export const ClientRoutes = () =>
  async function (fastify: FastifyCustomInstance) {
    fastify.get('/', async function (req, reply) {
      const stream = fs.createReadStream(join(__dirname, 'client.html'));

      reply.type('text/html');
      return stream;
    });

    fastify.get('/vidstack.js', async function (req, reply) {
      const stream = fs.createReadStream(join(__dirname, 'vidstack.js'));

      reply.type('application/javascript');
      return stream;
    });

    fastify.get('/vidstack.theme.css', async function (req, reply) {
      const stream = fs.createReadStream(join(__dirname, 'vidstack.theme.css'));

      reply.type('text/css');
      return stream;
    });

    fastify.get('/vidstack.video.css', async function (req, reply) {
      const stream = fs.createReadStream(join(__dirname, 'vidstack.video.css'));

      reply.type('text/css');
      return stream;
    });
  };
