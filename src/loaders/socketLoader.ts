export const loadSocket = (fastify: FastifyCustomInstance) => {
  logger.info(`[Socket] Socket loaded`);
  fastify.io.on('connection', (socket) => {
    logger.debug(`New connection to socketIO :  ${socket.id}`);

    socket.on('disconnecting', () => {
      logger.debug(`New disconnection to socketIO :  ${socket.id}`);
    });

    socket.on('join-room', (id) => {
      logger.debug(`Join room :  ${socket.id} -> ${id}`);
      socket.join(id);
    });

    socket.on('ping', () => {
      fastify.io.to(socket.id).emit('ping', 'pong');
    });
  });
};
