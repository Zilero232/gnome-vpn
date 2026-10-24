import { CLIENT_IDS, PLANS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { CALLBACK_PREFIX, CALLBACK_VALUE } from '@/modules/telegram/config';

import {
  autoRenewChoice,
  broadcastAnswer,
  broadcastChoice,
  callbackPattern,
  countFrom,
  deviceAnswer,
  isConfirmed,
  offersChoice,
  parseClientId,
  parsePlanId,
  parseUuid,
  wireguardChoice
} from '../callback-data';

const deviceId = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

const { separator, answer, switch: toggle } = CALLBACK_VALUE;

describe('callbackPattern', () => {
  it('matches a payload carrying the prefix', () => {
    expect(callbackPattern(CALLBACK_PREFIX.plan).test(`${CALLBACK_PREFIX.plan}monthly`)).toBe(true);
    expect(callbackPattern(CALLBACK_PREFIX.locale).test(`${CALLBACK_PREFIX.locale}ru`)).toBe(true);
  });

  it('anchors at the start rather than matching anywhere', () => {
    expect(callbackPattern(CALLBACK_PREFIX.plan).test(`x${CALLBACK_PREFIX.plan}monthly`)).toBe(false);
  });

  it('keeps the two prefixes apart', () => {
    expect(callbackPattern(CALLBACK_PREFIX.plan).test(`${CALLBACK_PREFIX.locale}ru`)).toBe(false);
  });

  it('treats a metacharacter as a literal instead of a wildcard', () => {
    const pattern = callbackPattern('a.c:');

    expect(pattern.test('a.c:1')).toBe(true);
    expect(pattern.test('abc:1')).toBe(false);
  });

  it('returns a fresh pattern so a global flag cannot carry state between calls', () => {
    const payload = `${CALLBACK_PREFIX.plan}monthly`;

    expect(callbackPattern(CALLBACK_PREFIX.plan).test(payload)).toBe(true);
    expect(callbackPattern(CALLBACK_PREFIX.plan).test(payload)).toBe(true);
  });
});

describe('isConfirmed', () => {
  it('accepts only the exact confirming payload', () => {
    expect(isConfirmed(answer.yes)).toBe(true);
    expect(isConfirmed('no')).toBe(false);
    expect(isConfirmed('')).toBe(false);
    expect(isConfirmed(`${answer.yes} `)).toBe(false);
  });
});

describe('countFrom', () => {
  it('accepts a count inside the range', () => {
    expect(countFrom({ raw: '1', max: 8 })).toBe(1);
    expect(countFrom({ raw: '8', max: 8 })).toBe(8);
  });

  it('refuses anything past the limit, so a crafted payload cannot overbuy', () => {
    expect(countFrom({ raw: '9', max: 8 })).toBeNull();
    expect(countFrom({ raw: '1000', max: 8 })).toBeNull();
  });

  it('refuses a number Number() would otherwise accept', () => {
    expect(countFrom({ raw: ' 2', max: 8 })).toBeNull();
    expect(countFrom({ raw: '0x2', max: 8 })).toBeNull();
    expect(countFrom({ raw: '1e3', max: 8 })).toBeNull();
    expect(countFrom({ raw: 'Infinity', max: 8 })).toBeNull();
  });

  it('refuses what is not a whole positive number', () => {
    expect(countFrom({ raw: '0', max: 8 })).toBeNull();
    expect(countFrom({ raw: '-1', max: 8 })).toBeNull();
    expect(countFrom({ raw: '1.5', max: 8 })).toBeNull();
    expect(countFrom({ raw: 'two', max: 8 })).toBeNull();
    expect(countFrom({ raw: '', max: 8 })).toBeNull();
  });
});

describe('autoRenewChoice', () => {
  it('reads the two choices a button can carry', () => {
    expect(autoRenewChoice(toggle.on)).toBe(toggle.on);
    expect(autoRenewChoice(toggle.off)).toBe(toggle.off);
  });

  it('refuses anything else rather than falling back to off', () => {
    expect(autoRenewChoice('anything')).toBeNull();
    expect(autoRenewChoice('')).toBeNull();
    expect(autoRenewChoice('ON')).toBeNull();
    expect(autoRenewChoice(answer.yes)).toBeNull();
  });
});

describe('offersChoice', () => {
  it('reads nothing but the two known answers', () => {
    expect(offersChoice(toggle.on)).toBe(true);
    expect(offersChoice(toggle.off)).toBe(false);
    expect(offersChoice('maybe')).toBeNull();
    expect(offersChoice('')).toBeNull();
  });
});

describe('parseUuid', () => {
  it('accepts a device id', () => {
    expect(parseUuid(deviceId)).toBe(deviceId);
  });

  it('refuses anything that is not shaped like one, so a crafted press reaches no query', () => {
    expect(parseUuid('')).toBeNull();
    expect(parseUuid(` ${deviceId}`)).toBeNull();
    expect(parseUuid(`${deviceId}x`)).toBeNull();
    expect(parseUuid('__proto__')).toBeNull();
    expect(parseUuid(deviceId.replaceAll('-', ''))).toBeNull();
  });
});

describe('parsePlanId', () => {
  it('accepts every id we actually render', () => {
    for (const each of PLANS) {
      expect(parsePlanId(each.id)).toBe(each.id);
    }
  });

  it('refuses anything that is not a plan', () => {
    expect(parsePlanId('made-up')).toBeNull();
    expect(parsePlanId('')).toBeNull();
    expect(parsePlanId('__proto__')).toBeNull();
  });
});

describe('parseClientId', () => {
  it('accepts every id the registry holds', () => {
    for (const id of CLIENT_IDS) {
      expect(parseClientId(id)).toBe(id);
    }
  });

  it('refuses anything else, so a crafted payload cannot index the registry', () => {
    expect(parseClientId('made-up')).toBeNull();
    expect(parseClientId('')).toBeNull();
    expect(parseClientId('__proto__')).toBeNull();
    expect(parseClientId('constructor')).toBeNull();
  });
});

describe('deviceAnswer', () => {
  it('reads a yes and a no for the same device', () => {
    expect(deviceAnswer(`${answer.yes}${separator}${deviceId}`)).toEqual({ isConfirmed: true, deviceId });
    expect(deviceAnswer(`${answer.no}${separator}${deviceId}`)).toEqual({ isConfirmed: false, deviceId });
  });

  it('refuses an answer that is neither yes nor no rather than reading it as one', () => {
    expect(deviceAnswer(`maybe${separator}${deviceId}`)).toBeNull();
    expect(deviceAnswer(`${separator}${deviceId}`)).toBeNull();
  });

  it('refuses a payload without a well-formed device', () => {
    expect(deviceAnswer(answer.yes)).toBeNull();
    expect(deviceAnswer(`${answer.yes}${separator}`)).toBeNull();
    expect(deviceAnswer(`${answer.yes}${separator}not-a-device`)).toBeNull();
    expect(deviceAnswer(`${answer.yes}${separator}${deviceId}${separator}extra`)).toBeNull();
  });
});

describe('wireguardChoice', () => {
  const [phone] = CALLBACK_VALUE.wireguardKinds;

  it('reads a node and a known kind of device', () => {
    expect(wireguardChoice(`${deviceId}${separator}${phone}`)).toEqual({ nodeId: deviceId, kind: phone });
  });

  it('refuses a kind it does not offer', () => {
    expect(wireguardChoice(`${deviceId}${separator}toaster`)).toBeNull();
  });

  it('refuses a node that is not a UUID', () => {
    expect(wireguardChoice(`node${separator}${phone}`)).toBeNull();
  });

  it('refuses a payload with a part too many or too few', () => {
    expect(wireguardChoice(deviceId)).toBeNull();
    expect(wireguardChoice(`${deviceId}${separator}${phone}${separator}x`)).toBeNull();
  });
});

describe('broadcastChoice and broadcastAnswer', () => {
  it('read the audience, the message and the answer', () => {
    expect(broadcastChoice('all:42')).toEqual({ audience: 'all', source: 42 });
    expect(broadcastAnswer('no:inactive:42')).toEqual({ audience: 'inactive', source: 42, isConfirmed: false });
  });

  it('refuse a crafted payload rather than guessing', () => {
    expect(broadcastChoice('everyone:42')).toBeNull();
    expect(broadcastChoice('all:-1')).toBeNull();
    expect(broadcastChoice('all:0x2a')).toBeNull();
    expect(broadcastChoice('all:42:extra')).toBeNull();
    expect(broadcastChoice(`all:${Number.MAX_SAFE_INTEGER}0`)).toBeNull();
    expect(broadcastAnswer('maybe:all:42')).toBeNull();
    expect(broadcastAnswer('yes:all')).toBeNull();
  });
});
