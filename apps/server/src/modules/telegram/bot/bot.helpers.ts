import { WEBHOOK } from './bot.config';

export const webhookUrl = (base: string): string => new URL(`/${WEBHOOK.path}`, base).href;
