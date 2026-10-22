import type { WireguardConfig, WireguardNode, WireguardOverview } from '@gnomevpn/schemas';

import type { BotLocale, BotText } from '../../telegram.types';
import type { TextFill } from '../fill-text';

export type WireguardNotice = {
  key: keyof BotText;
  fill?: TextFill;
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

export type NodeLabelInput = {
  node: Pick<WireguardNode, 'city' | 'country' | 'countryCode'>;
  locale: BotLocale;
};

export type WireguardCaptionInput = {
  config: WireguardConfig;
  how: string;
  locale: BotLocale;
};
