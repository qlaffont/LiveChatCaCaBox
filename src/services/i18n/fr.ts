import { enLang } from './en';

export const frLang: typeof enLang = {
  commandError: 'Problème avec cette commande ! Veuillez vérifier les logs !',
  i18nLoaded: 'Langue française chargée !',
  serverStarted: 'Le serveur est lancé !',
  success: 'Succès !',
  error: 'Erreur !',

  discordCommands: 'Chargement des commandes Discord',
  discordCommandLoaded: 'Commande chargée : /{{command}} ✅',
  discordInvite: 'Pour inviter le bot : {{lien}}',
  discordBotReady: 'En ligne ! Connecté en tant que {{username}}',

  aliveCommand: 'dispo',
  aliveCommandDescription: 'Vérifiez si le bot est vivant',
  aliveCommandsAnswer: '{{username}}, Je suis en vie !',

  clientCommand: 'client',
  clientCommandDescription: 'Obtenez un lien OBS pour intégrer LiveChat',
  clientCommandsAnswer: 'Voici le lien : {{link}}',

  sendCommand: 'msg',
  sendCommandDescription: 'Envoyer du contenu sur le stream',
  sendCommandOptionURL: 'lien',
  sendCommandOptionURLDescription: 'Lien du contenu sur le stream',
  sendCommandOptionText: 'texte',
  sendCommandOptionTextDescription: 'Texte à afficher',
  sendCommandOptionMedia: 'média',
  sendCommandOptionMediaDescription: 'Média à afficher',
  sendCommandAnswer: 'Contenu reçu ! Il sera bientôt joué !',

  hideSendCommand: 'cmsg',
  hideSendCommandDescription: 'Envoyer du contenu sur le stream (mais caché 😈)',
  hideSendCommandOptionURL: 'lien',
  hideSendCommandOptionURLDescription: 'Lien du contenu sur le stream',
  hideSendCommandOptionText: 'texte',
  hideSendCommandOptionTextDescription: 'Texte à afficher',
  hideSendCommandOptionMedia: 'média',
  hideSendCommandOptionMediaDescription: 'Média à afficher',
  hideSendCommandAnswer: 'Contenu reçu ! Il sera bientôt joué !',

  talkCommand: 'dire',
  talkCommandDescription: 'Demandez à un bot de dire quelque chose',
  talkCommandOptionText: 'texte',
  talkCommandOptionTextDescription: 'Texte à afficher',
  talkCommandOptionVoice: 'dire',
  talkCommandOptionVoiceDescription: 'Texte à dire',
  talkCommandAnswer: 'Contenu reçu ! Il sera bientôt joué !',

  hideTalkCommand: 'cdire',
  hideTalkCommandDescription: 'Demandez à un bot de dire quelque chose (mais caché 😈)',
  hideTalkCommandOptionText: 'texte',
  hideTalkCommandOptionTextDescription: 'Texte à afficher',
  hideTalkCommandOptionVoice: 'dire',
  hideTalkCommandOptionVoiceDescription: 'Texte à dire',
  hideTalkCommandAnswer: 'Contenu reçu ! Il sera bientôt joué !',
};
