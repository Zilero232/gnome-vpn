import { InlineKeyboard } from 'grammy';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { BotMessage, BotText } from '../../telegram.types';
import type { WireguardCaptionInput, WireguardKindViewInput, WireguardViewInput } from './wireguard-view.types';

import { BOT_TEXT, CALLBACK_PREFIX, SUBJECT_SEPARATOR, WIREGUARD_KINDS } from '../../config';
import { fillLabel, fillText } from '../fill-text';
import { html } from '../html';
import { menuButtons } from '../keyboard';
import { nodeLabel } from './wireguard-view.helpers';

export const wireguardView = ({ overview, locale, notice }: WireguardViewInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const { configs, nodes, deviceCount, deviceLimit } = overview;
  const live = nodes.filter((node) => !node.isDown);
  const isFull = deviceCount >= deviceLimit;

  const files = configs.map((config) => [
    InlineKeyboard.text(
      fillLabel({ text: text.wireguardFileButton, fill: { name: config.name } }),
      `${CALLBACK_PREFIX.wireguardFile}${config.deviceId}`
    )
  ]);

  const servers = live.map((node) => [
    InlineKeyboard.text(
      { text: fillLabel({ text: text.wireguardNodeButton, fill: { server: nodeLabel({ node, locale }) } }), style: 'success' },
      `${CALLBACK_PREFIX.wireguardNode}${node.id}`
    )
  ]);

  const markup = InlineKeyboard.from([...files, ...(isFull ? menuButtons({ locale, keys: ['devices'] }).inline_keyboard : servers)]);

  const next = match({ isFull, hasServers: nodes.length > 0, hasLive: live.length > 0 })
    .returnType<keyof BotText>()
    .with({ isFull: true }, () => 'wireguardFull')
    .with({ hasServers: false }, () => 'wireguardNoServers')
    .with({ hasLive: false }, () => 'wireguardAllDown')
    .otherwise(() => 'wireguardPick');

  const saysServersAreOut = next === 'wireguardAllDown' || next === 'wireguardNoServers';
  const isNoticeMoot = notice?.key === next || (saysServersAreOut && notice?.key === 'wireguardUnavailable');
  const lead = isNullish(notice) || isNoticeMoot ? null : fillText({ text: text[notice.key], fill: notice.fill ?? {} });

  return {
    text: html.paragraphs([
      lead,
      fillText({ text: text.wireguardIntro, fill: { count: String(deviceCount), limit: String(deviceLimit) } }),
      configs.length > 0 ? text.wireguardConfigs : null,
      text[next],
      text.wireguardNote
    ]),
    markup
  };
};

export const wireguardKindView = ({ node, locale }: WireguardKindViewInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const markup = new InlineKeyboard();

  for (const { kind, icon, name } of WIREGUARD_KINDS) {
    markup.text(`${icon} ${text[name]}`, `${CALLBACK_PREFIX.wireguardCreate}${node.id}${SUBJECT_SEPARATOR}${kind}`).success();
  }

  markup.row().text(text.wireguardBack, CALLBACK_PREFIX.wireguard);

  return { text: fillText({ text: text.wireguardKindAsk, fill: { server: nodeLabel({ node, locale }) } }), markup };
};

export const wireguardCaption = ({ config, how, locale }: WireguardCaptionInput): string =>
  fillText({ text: BOT_TEXT[locale].wireguardCaption, fill: { name: config.name, server: nodeLabel({ node: config.node, locale }), how } });
