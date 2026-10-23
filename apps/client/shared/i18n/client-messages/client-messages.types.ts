import type { Locale } from '../locale';
import type { Messages } from '../messages';
import type { ROUTE_MESSAGES } from './client-messages.constants';

export type ClientRule = 'all' | readonly string[];

export type ClientRules = Partial<Record<keyof Messages, ClientRule>>;

export type KeepsKeyInput = {
  namespace: keyof Messages;
  key: string;
};

export type RouteNamespace = (typeof ROUTE_MESSAGES)[number];

export type RouteMessagesInput = {
  locale: Locale;
  namespaces: readonly RouteNamespace[];
};
