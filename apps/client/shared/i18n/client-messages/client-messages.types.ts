import type { Messages } from '../messages';

export type ClientRule = 'all' | readonly string[];

export type ClientRules = Partial<Record<keyof Messages, ClientRule>>;

export type KeepsKeyInput = {
  namespace: keyof Messages;
  key: string;
};
