import { isDeepEqual, isDefined, isPlainObject, isString, omit, pickBy } from 'remeda';

import type { CoversInput, InboundMatchesInput } from './xray-panel.types';

import { readJson } from '../panel-config';

const parsed = (value: unknown): unknown => {
  if (!isString(value)) {
    return value;
  }

  return value.length === 0 ? undefined : readJson(value);
};

const covers = ({ wanted, actual }: CoversInput): boolean => {
  if (!isPlainObject(wanted)) {
    return isDeepEqual(wanted, actual);
  }

  return isPlainObject(actual) && Object.entries(wanted).every(([key, value]) => covers({ wanted: value, actual: actual[key] }));
};

export const inboundMatches = ({ current, desired }: InboundMatchesInput): boolean => {
  const settings = isPlainObject(desired.settings) ? omit(desired.settings, ['clients']) : desired.settings;

  const wanted = pickBy(
    {
      port: desired.port,
      protocol: desired.protocol,
      settings,
      streamSettings: desired.streamSettings,
      sniffing: desired.sniffing
    },
    isDefined
  );

  const actual = {
    port: current.port,
    protocol: current.protocol,
    settings: parsed(current.settings),
    streamSettings: parsed(current.streamSettings),
    sniffing: parsed(current.sniffing)
  };

  return covers({ wanted, actual });
};
