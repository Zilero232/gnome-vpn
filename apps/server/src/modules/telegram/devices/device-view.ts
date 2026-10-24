import { CLIENT_IDS, CLIENT_REGISTRY, EXTRA_DEVICE_PRICE_RUB, extraDevicesPriceRub } from '@gnomevpn/schemas';
import { InlineKeyboard } from 'grammy';
import { isEmpty, isNonNullish, isNullish, range } from 'remeda';
import { match } from 'ts-pattern';

import type { ConfirmCopy } from '../shared/keyboard';
import type { BotLocale, BotMessage, BotText } from '../telegram.types';
import type {
  ClientNameInput,
  ClientViewInput,
  DeviceLineInput,
  DeviceNameInput,
  DevicesTextInput,
  DevicesViewInput,
  PlatformNamesInput,
  RemoveDeviceCopyInput,
  WireguardCaptionInput,
  WireguardKindViewInput,
  WireguardNameInput,
  WireguardViewInput
} from './devices.types';

import { BOT_BUTTONS, BOT_PLATFORMS, BOT_TEXT, CALLBACK_VALUE } from '../config';
import { callbackData } from '../shared/callback-data';
import { isButtonUrl, menuButtons } from '../shared/keyboard';
import { fillLabel, fillText, formatDate, html, nodeLabel } from '../shared/text';
import { CLIENT, DEVICE_CHOICES, WIREGUARD } from './devices.config';

const present = (values: (string | null)[]): string[] => values.filter(isNonNullish).filter((value) => !isEmpty(value.trim()));

export const deviceName = ({ device, locale }: DeviceNameInput): string =>
  present([device.model, device.app]).at(0) ?? BOT_TEXT[locale].deviceUnnamed;

export const deviceLabel = ({ device, index, locale }: DeviceLineInput): string => `${index + 1}. ${deviceName({ device, locale })}`;

export const deviceLine = ({ device, index, locale }: DeviceLineInput): string => {
  const text = BOT_TEXT[locale];
  const name = deviceName({ device, locale });
  const system = present([device.platform, device.osVersion]).join(' ');
  const details = present([system, device.app === name ? null : device.app]).join(', ');
  const title = present([html.bold(deviceLabel({ device, index, locale })), html.escape(details)]).join(' — ');
  const mark = device.isOverLimit ? `\n${text.deviceOverLimit}` : '';
  const lastSeen = fillText({ text: text.deviceLastSeen, fill: { date: formatDate({ iso: device.lastSeenAt, locale }) } });

  return [`${title}${mark}`, html.italic(lastSeen)].join('\n');
};

export const devicesText = ({ list, locale }: DevicesTextInput): string => {
  const text = BOT_TEXT[locale];
  const header = fillText({ text: text.devicesHeader, fill: { count: String(list.devices.length), limit: String(list.deviceLimit) } });

  if (isEmpty(list.devices)) {
    return [header, '', text.devicesEmpty].join('\n');
  }

  const lines = list.devices.map((device, index) => deviceLine({ device, index, locale }));

  return [header, ...lines].join('\n\n');
};

export const devicesView = ({ list, status, locale, notice }: DevicesViewInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const isPaid = status.period === 'paid';
  const room = status.limits.maxExtraDevices - status.limits.extraDevices;
  const choices = DEVICE_CHOICES.filter((quantity) => quantity <= room);
  const isFull = choices.length === 0;
  const canAdd = isPaid && !isFull;
  const removals = list.devices.map((device) => [
    InlineKeyboard.text(
      fillLabel({ text: text.deviceRemoveButton, fill: { name: deviceName({ device, locale }) } }),
      callbackData.forgetDevice(device.id)
    )
  ]);

  const purchases = choices.map((quantity) =>
    InlineKeyboard.text(
      {
        text: fillLabel({ text: text.devicesBuy, fill: { count: String(quantity), price: String(extraDevicesPriceRub(quantity)) } }),
        style: 'success'
      },
      callbackData.devices(quantity)
    )
  );

  const extras = match({ isPaid, isFull })
    .with({ isPaid: false }, () => [])
    .with({ isFull: true }, () => [[InlineKeyboard.disabled(text.devicesFull)]])
    .otherwise(() => [purchases]);

  const markup = InlineKeyboard.from([...removals, ...extras]);

  const offer = canAdd ? fillText({ text: text.devicesExtra, fill: { price: String(EXTRA_DEVICE_PRICE_RUB) } }) : null;

  return { text: html.paragraphs([notice, devicesText({ list, locale }), offer]), markup };
};

export const removeDeviceCopy = ({ copy, name }: RemoveDeviceCopyInput): ConfirmCopy => ({
  ask: fillText({ text: copy.deviceRemoveAsk, fill: { name } }),
  yes: copy.deviceRemoveYes,
  no: copy.deviceRemoveNo
});

export const wireguardView = ({ overview, locale, notice }: WireguardViewInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const { configs, nodes, deviceCount, deviceLimit } = overview;
  const live = nodes.filter((node) => !node.isDown);
  const isFull = deviceCount >= deviceLimit;

  const files = configs.map((config) => [
    InlineKeyboard.text(fillLabel({ text: text.wireguardFileButton, fill: { name: config.name } }), callbackData.wireguardFile(config.deviceId))
  ]);

  const servers = live.map((node) => [
    InlineKeyboard.text(
      { text: fillLabel({ text: text.wireguardNodeButton, fill: { server: nodeLabel({ node, locale }) } }), style: 'success' },
      callbackData.wireguardNode(node.id)
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

  for (const kind of CALLBACK_VALUE.wireguardKinds) {
    const { icon, name } = WIREGUARD.kinds[kind];

    markup.text(`${icon} ${text[name]}`, callbackData.wireguardCreate({ nodeId: node.id, kind })).success();
  }

  markup.row().text(text.wireguardBack, callbackData.wireguard());

  return { text: fillText({ text: text.wireguardKindAsk, fill: { server: nodeLabel({ node, locale }) } }), markup };
};

export const wireguardCaption = ({ config, how, locale }: WireguardCaptionInput): string =>
  fillText({ text: BOT_TEXT[locale].wireguardCaption, fill: { name: config.name, server: nodeLabel({ node: config.node, locale }), how } });

export const wireguardName = ({ base, taken }: WireguardNameInput): string => {
  const used = new Set(taken);
  const numbered = range(WIREGUARD.firstSuffix, WIREGUARD.firstSuffix + taken.length + 1).map((suffix) => `${base} ${suffix}`);

  return [base, ...numbered].find((candidate) => !used.has(candidate)) ?? base;
};

export const clientLabel = (id: ClientNameInput['id']): string => CLIENT.labels[id];

export const clientName = ({ id, locale }: ClientNameInput): string => {
  const label = CLIENT.labels[id];

  return CLIENT_REGISTRY[id].isRecommended ? `${label} ${CLIENT.recommendedMark} ${BOT_TEXT[locale].appsRecommended}` : label;
};

export const clientPaste = ({ id, locale }: ClientNameInput): string => BOT_TEXT[locale][CLIENT.paste[id]];

export const platformNames = ({ platforms, locale }: PlatformNamesInput): string =>
  platforms.map((platform) => BOT_PLATFORMS[locale][platform]).join(', ');

export const appsKeyboard = (locale: BotLocale): InlineKeyboard =>
  InlineKeyboard.from([
    ...CLIENT_IDS.map((id) => {
      const style = CLIENT_REGISTRY[id].isRecommended ? 'primary' : undefined;

      return [InlineKeyboard.text({ text: clientName({ id, locale }), style }, callbackData.client(id))];
    }),
    [InlineKeyboard.text(BOT_BUTTONS[locale].wireguard, callbackData.wireguard())]
  ]);

export const clientView = ({ client, locale }: ClientViewInput): BotMessage => {
  const text = BOT_TEXT[locale];
  const { id } = client;
  const platforms = platformNames({ platforms: client.platforms, locale });
  const heading = [html.bold(clientName({ id, locale })), fillText({ text: text.appsPlatforms, fill: { platforms } })].join('\n');
  const steps = fillText({ text: text.appsSteps, fill: { how: clientPaste({ id, locale }) } });
  const canLinkDownload = isButtonUrl(client.downloadUrl);
  const markup = new InlineKeyboard().copyText(text.appsCopyLink, client.copyUrl).primary().row();

  if (canLinkDownload) {
    markup.url(fillLabel({ text: text.appsDownload, fill: { name: clientLabel(id) } }), client.downloadUrl).row();
  }

  markup.text(text.appsBack, callbackData.client(CALLBACK_VALUE.clientList));

  return { text: html.paragraphs([heading, steps, canLinkDownload ? null : html.escape(client.downloadUrl)]), markup };
};
