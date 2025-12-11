# LiveChat CCB

Demonstration :

[![Watch the video](https://img.youtube.com/vi/SVI3SKVrznE/default.jpg)](https://youtu.be/SVI3SKVrznE)

For english language, please scroll down to ENGLISH.

## FRANÇAIS

Cette application est inspirée d'un projet (LiveChat) qui a été développé par un groupe de streameur appelé [Cacabox](https://www.youtube.com/channel/uc6izvpg2aik83k-rqs6agma).

L'objectif de cette application est d'envoyer du contenu sur une page Web qui est utilisée dans un logiciel de diffusion comme OBS, XSplit, etc.

Une version hébergée existe sur la plateforme [LeStudio](https://lestudio.qlaffont.com) !

**Aucun support ne sera traitée si vous ne maitrisez pas Docker OU JavaScript.**

### Caractéristiques

- Envoyez tout type de contenu (audio, vidéo, image, texte) sur le stream
- Générez un audio de bot à jouer sur le stream

### Commandes Discord

- `/dispo` -> Vérifiez si le bot est vivant
- `/client` -> Obtenez un lien pour intégrer livechat dans obs, xsplit
- `/msg` -> Envoyer du contenu au flux
- `/cmsg` -> Envoyez du contenu au flux (mais caché 😈)
- `/dire` -> Demandez à un bot de dire quelque chose
- `/cire` -> Demandez à un bot de dire quelque chose (mais caché 😈)

### Customisation

Si vous souhaitez modifier le rendu du bot, il vous suffit de modifier le fichier dans `src/components/client/client.html` !
(Attention si vous êtes sur docker il faut rebuild l'application !)

### Installation

#### 1 - Informations Discord

- Vous devez d'abord créer une application Discord: https://discord.com/developers/applications?new_application=true
- Vous devez définir un nom du bot (ce nom sera affiché)
- Après cela, vous devez **copier l'ID de l'application sur cette page**
- Accédez à la barre latérale gauche et cliquez sur "Bot" et cliquez sur le bouton "Réinitialiser le jeton".
- Après cela, vous devez **copier le Token sur cette page**

#### 2 - Installation

Vous pouvez installer cette application par deux manières.

Si vous avez [Docker](https://www.docker.com/get-started/) et vous voulez la construire vous:

```bash
git clone https://github.com/qlaffont/LiveChatCCB

docker build -t qlaffont-livechatccb .

docker run -p 3000:3000 qlaffont-livechatccb \
-e DISCORD_TOKEN='DISCORD-TOKEN-TO-REPLACE' \ # <-- Remplacer par le token Discord
-e DISCORD_CLIENT_ID='DISCORD-ID-TO-REPLACE' \ # <--Remplacer par l'ID de l'application Discord
-e DEFAULT_DURATION='5' \ # <-- Durée par défaut si le contenu n'est pas vidéo ou audio
-e HIDE_COMMANDS_DISABLED='false' \ # <-- Si vous souhaitez désactiver les commandes masquées, vous pouvez modifier la valeur de 'false' à 'true'
-e API_URL='API-URL-TO-REPLACE' # <-- Remplacer par l'adresse où l'utilisateur se connectera (Ex: https://livechat.domainname.com)
```

OU

Vous voulez l'installer manuellement:

**Exigences**
- [Node 20](https://nodejs.org/en)
- [pnpm](https://pnpm.io/fr/installation)
- OS avec [ffmpeg](https://ffmpeg.org/)

```bash
cp .env.example .env # Remplacer DISCORD_TOKEN/DISCORD_CLIENT_ID/API_URL avec vos informations
pnpm install
pnpm dev
```

#### 3 - Invitez le bot

Lorsque vous demarrez l'application, dans le journal, vous verrez l'invitation.

Exemple:

```bash
INFO : [DISCORD] En ligne ! Connecté en tant que xxxx
INFO : [DISCORD] Pour inviter le bot : https://discord.com/oauth2/authorize?client_id=xxxx&scope=bot
```

### Démarrage automatique (Windows 11)

Pour les utilisateurs Windows 11 qui souhaitent que le bot démarre automatiquement au démarrage du PC :

#### Activer le démarrage automatique :
```bash
pnpm autostart:enable
```

#### Désactiver le démarrage automatique :
```bash
pnpm autostart:disable
```

Lorsque le démarrage automatique est activé, une fenêtre de console s'ouvrira automatiquement au démarrage de Windows, affichant les journaux du bot en temps réel.

Pour plus d'informations détaillées, consultez le fichier [AUTOSTART.md](./AUTOSTART.md).


## ENGLISH

This application is inspired from a project (LiveChat) who have been developed by streamer group called [Cacabox](https://www.youtube.com/channel/UC6izVPg2AiK83K-rqS6AgmA).

The objective of this application is to send content on a webpage who is used in a broadcast sofware like OBS, XSplit, etc.

An hosted version exist on [LeStudio](https://lestudio.qlaffont.com) !

**No support will be answered if you don't know Docker OR JavaScript.**

### Features

- Send any type of content (audio, video, image, text) to the stream
- Generate a bot audio to be played on stream

### Discord Commands

- `/alive` -> Check if bot is alive
- `/client` -> Get OBS link to integrate LiveChat into OBS, XSplit
- `/send` -> Send content to stream
- `/hsend` -> Send content to stream (but hided 😈)
- `/talk` -> Ask a bot to say something
- `/htalk` -> Ask a bot to say something (but hided 😈)

### Customisation

If you want to change the rendering of the bot, simply modify the file in `src/components/client/client.html` !
(Be careful if you run on Docker you have to rebuild the application !)

### Installation

#### 1 - Discord Informations

- First you need to create a Discord Application : https://discord.com/developers/applications?new_application=true
- You need to set a Discord Name (This name will be displayed)
- After that you need to **copy APPLICATION ID on this page**
- Go to the left sidebar and click on "Bot" and click on "Reset Token" button.
- After that you need to **copy TOKEN on this page**

#### 2 - Installation

You can install this application by two way.

If you have [Docker](https://www.docker.com/get-started/) and want to build it: 

```bash
git clone https://github.com/qlaffont/LiveChatCCB

docker build -t qlaffont-livechatccb .

docker run -p 3000:3000 qlaffont-livechatccb \
-e DISCORD_TOKEN='DISCORD-TOKEN-TO-REPLACE' \ # <--Replace with Discord Token
-e DISCORD_CLIENT_ID='DISCORD-ID-TO-REPLACE' \ # <--Replace with Discord Application Id
-e DEFAULT_DURATION='5' \ # <-- Default duration if content is not video or audio
-e HIDE_COMMANDS_DISABLED='false' \ # <-- If you want to disable hided commands, you can change the value from 'false' to 'true'
-e API_URL='API-URL-TO-REPLACE' \ # <--Replace with the endpoint where user will connect (Ex: https://livechat.domainname.com)
-e I18N='en'
```

OR

You can install it manually :

**Requirements**
- [Node 20](https://nodejs.org/en)
- [PNPM](https://pnpm.io/en/installation)
- System with [FFmpeg](https://ffmpeg.org/) install

```bash
cp .env.example .env # Replace DISCORD_TOKEN/DISCORD_CLIENT_ID/API_URL with your informations
pnpm install
pnpm dev
```

#### 3 - Invite the bot

When you will start the application, in log you will see the invite.

Exemple :

```bash
INFO : [DISCORD] Ready ! Logged in as xxxx
INFO : [DISCORD] To invite bot : https://discord.com/oauth2/authorize?client_id=xxxx&scope=bot
```

### Auto-Start (Windows 11)

For Windows 11 users who want the bot to start automatically when their PC boots:

#### Enable auto-start:
```bash
pnpm autostart:enable
```

#### Disable auto-start:
```bash
pnpm autostart:disable
```

When auto-start is enabled, a console window will automatically open on Windows startup, displaying the bot logs in real-time.

For detailed information, see [AUTOSTART.md](./AUTOSTART.md).
