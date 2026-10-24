import type { CALLBACK_VALUE } from '@/modules/telegram/config';

export type CallbackAnswer = (typeof CALLBACK_VALUE.answer)[keyof typeof CALLBACK_VALUE.answer];

export type SwitchChoice = (typeof CALLBACK_VALUE.switch)[keyof typeof CALLBACK_VALUE.switch];

export type WireguardKind = (typeof CALLBACK_VALUE.wireguardKinds)[number];

export type BroadcastAudience = (typeof CALLBACK_VALUE.audiences)[number];

export type AnswerDataInput = {
  prefix: string;
  answer: CallbackAnswer;
  subject?: string;
};

export type CountFromInput = {
  raw: string;
  max: number;
};

export type DeviceAnswer = {
  isConfirmed: boolean;
  deviceId: string;
};

export type WireguardChoice = {
  nodeId: string;
  kind: WireguardKind;
};

export type BroadcastChoice = {
  audience: BroadcastAudience;
  source: number;
};

export type BroadcastAnswer = BroadcastChoice & {
  isConfirmed: boolean;
};
