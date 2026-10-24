import { isIncludedIn, isNumber, isString, omit, sumBy } from 'remeda';

import { html } from '@/modules/telegram/shared/text';

import type { ApiFailure, ApiPayload, Repair } from './transformers.types';

import { SEND_DEFAULTS } from './transformers.constants';

const WIDTH = SEND_DEFAULTS.width;

const GRAPHEMES = new Intl.Segmenter('ru', { granularity: 'grapheme' });

const dropEffect: Repair = (payload) => omit(payload, ['message_effect_id']);

const asPlain: Repair = (payload) => {
  const rest = omit(payload, ['parse_mode']);

  return isString(rest.text) ? { ...rest, text: html.strip(rest.text) } : rest;
};

const REPAIRS = [
  { pattern: SEND_DEFAULTS.unknownEffect, repair: dropEffect },
  { pattern: SEND_DEFAULTS.brokenMarkup, repair: asPlain }
] as const;

const isPrivateChat = (chatId: unknown): boolean => (isNumber(chatId) || isString(chatId)) && Number(chatId) > 0;

export const isFormatted = (method: string): boolean => isIncludedIn(method, SEND_DEFAULTS.formattedMethods);

export const cellsOf = (line: string): number =>
  sumBy([...GRAPHEMES.segment(line)], ({ segment }) => (WIDTH.emoji.test(segment) ? WIDTH.emojiCells : 1));

export const withWidth = (payload: ApiPayload): ApiPayload => {
  const { text, chat_id: chatId } = payload;

  if (!isString(text) || !isPrivateChat(chatId) || WIDTH.filled.test(text)) {
    return payload;
  }

  const closing = text.match(WIDTH.closingBlocks)?.[0] ?? '';
  const body = text.slice(0, text.length - closing.length).replace(WIDTH.trailingSpace, '');
  const lines = html.strip(body).split('\n');
  const missing = WIDTH.cells - Math.max(...lines.map(cellsOf));

  if (missing <= 1) {
    return payload;
  }

  return { ...payload, text: `${body} ${WIDTH.fill.repeat(WIDTH.cells - cellsOf(lines.at(-1) ?? '') - 1)}${closing}` };
};

export const withDefaults = (payload: ApiPayload): ApiPayload =>
  withWidth({
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...payload
  });

export const repairFor = ({ error_code, description }: ApiFailure): Repair | null => {
  if (error_code !== SEND_DEFAULTS.badRequest) {
    return null;
  }

  return REPAIRS.find(({ pattern }) => pattern.test(description))?.repair ?? null;
};
