import type {
  ClientId,
  ClientLink,
  ClientPlatform,
  Device,
  DeviceList,
  SubscriptionStatus,
  WireguardConfig,
  WireguardConfigFile,
  WireguardNode,
  WireguardOverview
} from '@gnomevpn/schemas';
import type { Context } from 'grammy';

import type { TextFill } from '../shared/text';
import type { BotLocale, BotText, ResolvedChat } from '../telegram.types';

export type WireguardKindCopy = {
  icon: string;
  name: keyof BotText;
  how: keyof BotText;
};

export type WireguardNotice = {
  key: keyof BotText;
  fill?: TextFill;
};

export type DeviceNameInput = {
  device: Device;
  locale: BotLocale;
};

export type DeviceLineInput = {
  device: Device;
  index: number;
  locale: BotLocale;
};

export type DevicesTextInput = {
  list: DeviceList;
  locale: BotLocale;
};

export type DevicesViewInput = {
  list: DeviceList;
  status: Pick<SubscriptionStatus, 'limits' | 'period'>;
  locale: BotLocale;
  notice?: string;
};

export type RemoveDeviceCopyInput = {
  copy: BotText;
  name: string;
};

export type WireguardViewInput = {
  overview: WireguardOverview;
  locale: BotLocale;
  notice?: WireguardNotice;
};

export type WireguardKindViewInput = {
  node: WireguardNode;
  locale: BotLocale;
};

export type WireguardCaptionInput = {
  config: WireguardConfig;
  how: string;
  locale: BotLocale;
};

export type WireguardNameInput = {
  base: string;
  taken: string[];
};

export type ClientNameInput = {
  id: ClientId;
  locale: BotLocale;
};

export type PlatformNamesInput = {
  platforms: ClientPlatform[];
  locale: BotLocale;
};

export type ClientViewInput = {
  client: ClientLink;
  locale: BotLocale;
};

export type DevicesScreenInput = {
  chat: ResolvedChat;
  notice?: string;
  list?: DeviceList;
};

export type RemovalInput = {
  userId: string;
  deviceId: string;
  copy: BotText;
};

export type ShowClientInput = {
  ctx: Context;
  chat: ResolvedChat;
  id: ClientId;
};

export type ChatInput = {
  ctx: Context;
  chat: ResolvedChat;
};

export type WireguardDocumentInput = ChatInput & {
  file: WireguardConfigFile;
  how: string;
  notice?: WireguardNotice;
};

export type WireguardMakeInput = ChatInput & {
  value: string;
};

export type WireguardRefusedInput = ChatInput & {
  error: unknown;
};
