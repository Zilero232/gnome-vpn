import type { ClientId } from '@gnomevpn/schemas';

import { CLIENT_IDS, CLIENT_REGISTRY } from '@gnomevpn/schemas';
import { InlineKeyboard } from 'grammy';

import type { BotLocale } from '@/modules/telegram/telegram.types';

import { BOT_BUTTONS, BOT_PLATFORMS, BOT_TEXT, CALLBACK_PREFIX } from '@/modules/telegram/config';

import type { ClientNameInput, PlatformNamesInput } from './client-name.types';

import { CLIENT_LABELS, CLIENT_PASTE, RECOMMENDED_MARK } from './client-name.constants';

export const parseClientId = (raw: string): ClientId | null => CLIENT_IDS.find((id) => id === raw) ?? null;

export const clientLabel = (id: ClientId): string => CLIENT_LABELS[id];

export const clientName = ({ id, locale }: ClientNameInput): string => {
  const label = CLIENT_LABELS[id];

  return CLIENT_REGISTRY[id].isRecommended ? `${label} ${RECOMMENDED_MARK} ${BOT_TEXT[locale].appsRecommended}` : label;
};

export const clientPaste = ({ id, locale }: ClientNameInput): string => BOT_TEXT[locale][CLIENT_PASTE[id]];

export const platformNames = ({ platforms, locale }: PlatformNamesInput): string =>
  platforms.map((platform) => BOT_PLATFORMS[locale][platform]).join(', ');

export const appsKeyboard = (locale: BotLocale): InlineKeyboard =>
  InlineKeyboard.from([
    ...CLIENT_IDS.map((id) => {
      const style = CLIENT_REGISTRY[id].isRecommended ? 'primary' : undefined;

      return [InlineKeyboard.text({ text: clientName({ id, locale }), style }, `${CALLBACK_PREFIX.client}${id}`)];
    }),
    [InlineKeyboard.text(BOT_BUTTONS[locale].wireguard, CALLBACK_PREFIX.wireguard)]
  ]);
