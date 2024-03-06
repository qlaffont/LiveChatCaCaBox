import 'dotenv/config';
//@ts-ignore
// eslint-disable-next-line import/no-unresolved
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.string().default('development'),
    LOG: z.enum(['info', 'debug', 'error', 'silent', 'warning']).default('info'),
    PORT: z
      .string()
      .default('3000')
      .transform((s) => parseInt(s)),

    I18N: z.string().default('en'),

    API_URL: z.string().url(),

    DISCORD_TOKEN: z.string(),
    DISCORD_CLIENT_ID: z.string(),

    DATABASE_URL: z.string().url(),

    HIDE_COMMANDS_DISABLED: z.string().default('false'),
    DEFAULT_DURATION: z
      .string()
      .default('5')
      .transform((s) => parseInt(s)),
  },
  runtimeEnv: process.env,
});

export enum Environment {
  TEST = 'test',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PREPRODUCTION = 'preproduction',
  PRODUCTION = 'production',
}

export const currentEnv = () =>
  (!!env.NODE_ENV && env.NODE_ENV !== undefined ? env.NODE_ENV : Environment.DEVELOPMENT)
    ?.toString()
    ?.toLowerCase()
    ?.trim();
export const isProductionEnv = () => currentEnv() === Environment.PRODUCTION;
export const isPreProductionEnv = () => currentEnv() === Environment.PREPRODUCTION;
export const isStagingEnv = () => currentEnv() === Environment.STAGING;
export const isDevelopmentEnv = () => currentEnv() === Environment.DEVELOPMENT;
export const isTestEnv = () => currentEnv() === Environment.TEST;
export const isDeployedEnv = () =>
  Object.values(Environment)
    .filter((v) => v !== Environment.TEST && v !== Environment.DEVELOPMENT)
    .indexOf(currentEnv() as Environment) !== -1;
