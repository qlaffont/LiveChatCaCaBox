import { runServer } from './server';
import { env } from './services/env';

(async () => {
  global.env = env;
  //@ts-ignore
  process.env = env;

  const port: number = env.PORT ? env.PORT : 3000;

  const fastify = await runServer();

  fastify.ready(async () => { });
  fastify.listen({ port, host: '0.0.0.0', listenTextResolver: () => `[SERVER] ${rosetty.t('serverStarted')!}` }, (err) => {
    if (err) {
      logger.fatal(`${err}`);
      process.exit(1);
    }
  });
})();
