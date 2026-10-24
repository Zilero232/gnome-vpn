import { EXTRA_DEVICE_PRICE_RUB, extraDevicesPriceRub } from '@gnomevpn/schemas';
import { InlineKeyboard } from 'grammy';
import { match } from 'ts-pattern';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_TEXT, CALLBACK_PREFIX, DEVICE_CHOICES } from '@/modules/telegram/config';

import type { DevicesViewInput } from './devices-view.types';

import { deviceName, devicesText } from '../device-text';
import { fillLabel, fillText } from '../fill-text';
import { html } from '../html';

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
      `${CALLBACK_PREFIX.forgetDevice}${device.id}`
    )
  ]);

  const purchases = choices.map((quantity) =>
    InlineKeyboard.text(
      {
        text: fillLabel({ text: text.devicesBuy, fill: { count: String(quantity), price: String(extraDevicesPriceRub(quantity)) } }),
        style: 'success'
      },
      `${CALLBACK_PREFIX.devices}${quantity}`
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
