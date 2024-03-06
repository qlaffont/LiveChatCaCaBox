import { RosettyReturn, rosetty } from 'rosetty';
import { enGB, fr } from 'date-fns/locale';
import { enLang } from './en';
import { frLang } from './fr';

export type RosettyI18n = RosettyReturn<typeof enLang>;

export const loadRosetty = () => {
  const r = rosetty<typeof enLang>(
    {
      en: {
        dict: enLang,
        locale: enGB,
      },
      fr: {
        dict: frLang,
        locale: fr,
      },
    },
    env.I18N,
  );

  global.rosetty = r as RosettyI18n;

  logger.info(`[I18N] ${r.t('i18nLoaded')}`);
};
