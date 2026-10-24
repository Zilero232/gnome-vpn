import type { ClientId, PlanId } from '@gnomevpn/schemas';

import { clientIdSchema, planIdSchema } from '@gnomevpn/schemas';
import { isNullish } from 'remeda';
import { z } from 'zod';

import type { BotLocale, ButtonKey } from '@/modules/telegram/telegram.types';

import { CALLBACK_PREFIX, CALLBACK_VALUE } from '@/modules/telegram/config';

import type {
  AnswerDataInput,
  BroadcastAnswer,
  BroadcastChoice,
  CountFromInput,
  DeviceAnswer,
  SwitchChoice,
  WireguardChoice
} from './callback-data.types';

const { separator, answer, switch: toggle } = CALLBACK_VALUE;

const METACHARACTERS = /[$()*+.?[\\\]^{|}-]/gu;

const escapeRegExp = (value: string): string => value.replaceAll(METACHARACTERS, String.raw`\$&`);

const parse = <T>(schema: z.ZodType<T>, raw: string): T | null => schema.safeParse(raw).data ?? null;

const subjects = <T extends z.ZodType<unknown, string[]>>(tuple: T) =>
  z
    .string()
    .transform((raw) => raw.split(separator))
    .pipe(tuple);

const digitsSchema = z.string().regex(/^\d+$/u).transform(Number);

const confirmationSchema = z.enum([answer.yes, answer.no]).transform((value) => value === answer.yes);

const switchSchema = z.enum([toggle.on, toggle.off]);

const audienceSchema = z.enum(CALLBACK_VALUE.audiences);

const messageIdSchema = digitsSchema.pipe(z.number().int());

const deviceAnswerSchema = subjects(z.tuple([confirmationSchema, z.uuid()])).transform(([isConfirmed, deviceId]) => ({ isConfirmed, deviceId }));

const wireguardChoiceSchema = subjects(z.tuple([z.uuid(), z.enum(CALLBACK_VALUE.wireguardKinds)])).transform(([nodeId, kind]) => ({
  nodeId,
  kind
}));

const broadcastChoiceSchema = subjects(z.tuple([audienceSchema, messageIdSchema])).transform(([audience, source]) => ({ audience, source }));

const broadcastAnswerSchema = subjects(z.tuple([confirmationSchema, audienceSchema, messageIdSchema])).transform(
  ([isConfirmed, audience, source]) => ({ isConfirmed, audience, source })
);

export const callbackPattern = (prefix: string): RegExp => new RegExp(`^${escapeRegExp(prefix)}`, 'u');

export const callbackData = {
  menu: (key: ButtonKey): string => `${CALLBACK_PREFIX.menu}${key}`,
  plan: (planId: PlanId): string => `${CALLBACK_PREFIX.plan}${planId}`,
  locale: (locale: BotLocale): string => `${CALLBACK_PREFIX.locale}${locale}`,
  client: (id: ClientId | typeof CALLBACK_VALUE.clientList): string => `${CALLBACK_PREFIX.client}${id}`,
  autoRenew: (choice: SwitchChoice): string => `${CALLBACK_PREFIX.autoRenew}${choice}`,
  offers: (choice: SwitchChoice): string => `${CALLBACK_PREFIX.offers}${choice}`,
  devices: (quantity: number): string => `${CALLBACK_PREFIX.devices}${quantity}`,
  forgetDevice: (deviceId: string): string => `${CALLBACK_PREFIX.forgetDevice}${deviceId}`,
  wireguard: (): string => CALLBACK_PREFIX.wireguard,
  wireguardNode: (nodeId: string): string => `${CALLBACK_PREFIX.wireguardNode}${nodeId}`,
  wireguardCreate: ({ nodeId, kind }: WireguardChoice): string => `${CALLBACK_PREFIX.wireguardCreate}${nodeId}${separator}${kind}`,
  wireguardFile: (deviceId: string): string => `${CALLBACK_PREFIX.wireguardFile}${deviceId}`,
  broadcastAudience: ({ audience, source }: BroadcastChoice): string => `${CALLBACK_PREFIX.broadcastAudience}${audience}${separator}${source}`,
  broadcastSubject: ({ audience, source }: BroadcastChoice): string => `${audience}${separator}${source}`,
  answer: ({ prefix, answer: reply, subject }: AnswerDataInput): string =>
    isNullish(subject) ? `${prefix}${reply}` : `${prefix}${reply}${separator}${subject}`
} as const;

export const isConfirmed = (raw: string): boolean => raw === answer.yes;

export const countFrom = ({ raw, max }: CountFromInput): number | null => parse(digitsSchema.pipe(z.number().int().min(1).max(max)), raw);

export const autoRenewChoice = (raw: string): SwitchChoice | null => parse(switchSchema, raw);

export const offersChoice = (raw: string): boolean | null =>
  parse(
    switchSchema.transform((choice) => choice === toggle.on),
    raw
  );

export const parseUuid = (raw: string): string | null => parse(z.uuid(), raw);

export const parsePlanId = (raw: string): PlanId | null => parse(planIdSchema, raw);

export const parseClientId = (raw: string): ClientId | null => parse(clientIdSchema, raw);

export const deviceAnswer = (raw: string): DeviceAnswer | null => parse(deviceAnswerSchema, raw);

export const wireguardChoice = (raw: string): WireguardChoice | null => parse(wireguardChoiceSchema, raw);

export const broadcastChoice = (raw: string): BroadcastChoice | null => parse(broadcastChoiceSchema, raw);

export const broadcastAnswer = (raw: string): BroadcastAnswer | null => parse(broadcastAnswerSchema, raw);
