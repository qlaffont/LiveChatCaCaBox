import { addMilliseconds, addSeconds } from 'date-fns';

export const executeMessagesWorker = async (fastify: FastifyCustomInstance) => {
  //Get last message
  const lastMessage = await prisma.queue.findFirst({
    where: {
      executionDate: {
        lte: new Date(),
      },
    },
    orderBy: {
      executionDate: 'asc',
    },
  });

  if (lastMessage === null) {
    logger.debug(`[SOCKET] No new message`);
    return;
  }

  //Check if queue is playing
  const guild = await prisma.guild.findFirst({
    where: {
      id: lastMessage.discordGuildId,
      busyUntil: {
        gte: new Date(),
      },
    },
  });

  if (guild) {
    await prisma.queue.update({
      where: {
        id: lastMessage.id,
      },
      data: {
        executionDate: addMilliseconds(new Date(), 250),
      },
    });
    return;
  } else {
    let busyUntil = addSeconds(new Date(), lastMessage.duration);

    //Safety mesure
    busyUntil = addMilliseconds(busyUntil, 250);

    await prisma.guild.upsert({
      where: {
        id: lastMessage.discordGuildId,
      },
      create: {
        id: lastMessage.discordGuildId,
        busyUntil,
      },
      update: {
        busyUntil,
      },
    });
  }

  fastify.io.to(`messages-${lastMessage.discordGuildId}`).emit('new-message', lastMessage);
  logger.debug(`[SOCKET] New message ${lastMessage.id} (guild: ${lastMessage.discordGuildId}): ${lastMessage.content}`);

  await prisma.queue.delete({ where: { id: lastMessage.id } });

  const content = JSON.parse(lastMessage.content);
  return content.mediaDuration * 1000 || 5000;
};

//INFO : Optimization - Can be executed into a dedicated worker ?
export const loadMessagesWorker = async (fastify: FastifyCustomInstance) => {
  await executeMessagesWorker(fastify);

  setTimeout(() => {
    loadMessagesWorker(fastify);
  }, 100);
};
