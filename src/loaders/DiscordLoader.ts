import {
  REST,
  Client,
  Events,
  Collection,
  Routes,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  IntentsBitField,
} from 'discord.js';
import { aliveCommand } from '../components/discord/aliveCommand';
import { sendCommand } from '../components/messages/sendCommand';
import { hideSendCommand } from '../components/messages/hidesendCommand';
import { loadMessagesWorker } from '../components/messages/messagesWorker';
import { talkCommand } from '../components/messages/talkCommand';
import { hideTalkCommand } from '../components/messages/hidetalkCommand';
import { clientCommand } from '../components/discord/clientCommand';
import { helpCommand } from '../components/discord/helpCommand';
import { infoCommand } from '../components/discord/infoCommand';
import { setDefaultTimeCommand } from '../components/discord/setDefaultTimeCommand';
import { setDisplayMediaFullCommand } from '../components/discord/setDisplayFullCommand';
import { setMaxTimeCommand } from '../components/discord/setMaxTimeCommand';
import { stopCommand } from '../components/messages/stopCommand';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadDiscord = async (fastify: FastifyCustomInstance) => {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  global.discordRest = rest;

  const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });
  global.discordClient = client;

  // Load all discord commands
  await loadDiscordCommands(fastify);
  loadDiscordCommandsHandler();
  loadMessagesWorker(fastify);

  client.once(Events.ClientReady, (readyClient) => {
    logger.info(`[DISCORD] ${rosetty.t('discordBotReady', { username: readyClient.user.tag })}`);
    logger.info(
      `[DISCORD] ${rosetty.t('discordInvite', {
        link: `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&scope=bot`,
      })}`,
    );
  });

  client.on(Events.GuildCreate, (g) => {
    const channel = g.channels.cache.find(
      (channel) =>
        channel.type === ChannelType.GuildText &&
        channel.permissionsFor(g.members.me!).has(PermissionFlagsBits.SendMessages),
    );

    if (channel && channel.isTextBased()) {
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(rosetty.t('howToUseTitle')!)
            .setDescription(rosetty.t('howToUseDescription')!)
            .setColor(0x3498db),
        ],
      });
    }
  });

  await client.login(env.DISCORD_TOKEN);
};

const loadDiscordCommands = async (fastify: FastifyCustomInstance) => {
  try {
    logger.info(`[DISCORD] ${rosetty.t('discordCommands')}`);

    //@ts-ignore
    discordClient.commands = new Collection();

    const discordCommandsToRegister = [];

    const commands = [
      aliveCommand(),
      sendCommand(),
      talkCommand(),
      clientCommand(),
      helpCommand(),
      infoCommand(),
      setDefaultTimeCommand(),
      setDisplayMediaFullCommand(),
      setMaxTimeCommand(),
      stopCommand(fastify),
    ];
    const hideCommands = [hideSendCommand(), hideTalkCommand()];

    if (env.HIDE_COMMANDS_DISABLED !== 'true') {
      commands.push(...hideCommands);
    }

    global.commandsLoaded = [];

    for (const command of commands) {
      //@ts-ignore
      discordClient.commands.set(command.data.name, command);
      //@ts-ignore
      discordCommandsToRegister.push(command.data.toJSON());

      global.commandsLoaded.push(command.data.name);

      logger.info(`[DISCORD] ${rosetty.t('discordCommandLoaded', { command: command.data.name })}`);
    }

    await discordRest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: discordCommandsToRegister });
  } catch (error) {
    logger.error(error);
  }
};

const loadDiscordCommandsHandler = () => {
  discordClient.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    //@ts-ignore
    const command = discordClient.commands.get(interaction.commandName);

    if (!command) {
      return;
    }

    try {
      await command.handler(interaction, discordClient);
    } catch (error) {
      logger.error(error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle(rosetty.t('error')!)
              .setDescription(rosetty.t('commandError')!)
              .setColor(0xe74c3c),
          ],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(rosetty.t('error')!)
              .setDescription(rosetty.t('commandError')!)
              .setColor(0xe74c3c),
          ],
          ephemeral: true,
        });
      }
    }
  });
};
