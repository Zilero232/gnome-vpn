import { describe, expect, it } from 'vitest';

import { trimGeoList } from '../geo-list';
import { VARINT, WIRE_KEY, WIRE_TYPE } from '../geo-list.constants';

type FieldInput = {
  number: number;
  wireType: number;
  payload: number[];
};

type EntryInput = {
  code: string;
  domains?: string[];
  leading?: number[];
};

const varint = (value: number): number[] =>
  value < VARINT.base ? [value] : [(value % VARINT.base) + VARINT.continueBit, ...varint(Math.floor(value / VARINT.base))];

const field = ({ number, wireType, payload }: FieldInput): number[] => [
  ...varint(number * WIRE_KEY.typeModulus + wireType),
  ...(wireType === WIRE_TYPE.lengthDelimited ? varint(payload.length) : []),
  ...payload
];

const text = (value: string): number[] => [...new TextEncoder().encode(value)];

const entry = ({ code, domains = [], leading = [] }: EntryInput): number[] =>
  field({
    number: 1,
    wireType: WIRE_TYPE.lengthDelimited,
    payload: [
      ...leading,
      ...field({ number: 1, wireType: WIRE_TYPE.lengthDelimited, payload: text(code) }),
      ...domains.flatMap((domain) =>
        field({
          number: 2,
          wireType: WIRE_TYPE.lengthDelimited,
          payload: field({ number: 2, wireType: WIRE_TYPE.lengthDelimited, payload: text(domain) })
        })
      )
    ]
  });

const RU = entry({ code: 'CATEGORY-RU', domains: ['yandex.ru', 'vk.com'] });
const ADS = entry({ code: 'CATEGORY-ADS-ALL', domains: Array.from({ length: 200 }, (_, index) => `ads${index}.example`) });
const PRIVATE = entry({ code: 'PRIVATE', domains: ['lan'] });

const list = (...entries: number[][]): Uint8Array => new Uint8Array(entries.flat());

describe('trimGeoList', () => {
  it('keeps only the wanted entries, byte for byte and in upstream order', () => {
    const trimmed = trimGeoList({ data: list(RU, ADS, PRIVATE), codes: ['PRIVATE', 'CATEGORY-RU'] });

    expect([...trimmed.data]).toEqual([...RU, ...PRIVATE]);
    expect(trimmed.missing).toEqual([]);
  });

  it('matches the lower-case tags of a profile against the upper-case codes upstream stores', () => {
    const trimmed = trimGeoList({ data: list(RU, ADS, PRIVATE), codes: ['category-ru'] });

    expect([...trimmed.data]).toEqual(RU);
  });

  it('names every wanted tag the upstream file lacks, as the profile spells it', () => {
    expect(trimGeoList({ data: list(RU), codes: ['category-ru', 'category-gov-ru'] }).missing).toEqual(['category-gov-ru']);
  });

  it('finds the code when other fields come first in the entry', () => {
    const leading = [
      ...field({ number: 3, wireType: WIRE_TYPE.varint, payload: varint(300) }),
      ...field({ number: 68_000, wireType: WIRE_TYPE.lengthDelimited, payload: text('/path') }),
      ...field({ number: 4, wireType: WIRE_TYPE.fixed32, payload: [1, 2, 3, 4] }),
      ...field({ number: 5, wireType: WIRE_TYPE.fixed64, payload: [1, 2, 3, 4, 5, 6, 7, 8] })
    ];

    const odd = entry({ code: 'RU', leading });

    expect([...trimGeoList({ data: list(ADS, odd), codes: ['ru'] }).data]).toEqual(odd);
  });

  it('skips top-level fields that are not entries', () => {
    const stray = field({ number: 2, wireType: WIRE_TYPE.varint, payload: varint(7) });

    expect([...trimGeoList({ data: list(stray, RU), codes: ['category-ru'] }).data]).toEqual(RU);
  });

  it('is idempotent, so its output is a valid list of the same shape', () => {
    const once = trimGeoList({ data: list(RU, ADS, PRIVATE), codes: ['category-ru', 'private'] });

    expect([...trimGeoList({ data: once.data, codes: ['category-ru', 'private'] }).data]).toEqual([...once.data]);
  });

  it('refuses a file cut short instead of serving half an entry', () => {
    const whole = list(RU, ADS);

    expect(() => trimGeoList({ data: whole.subarray(0, whole.length - 5), codes: ['category-ru'] })).toThrow();
  });

  it('returns an empty list when nothing is wanted', () => {
    expect(trimGeoList({ data: list(RU, ADS), codes: [] }).data).toHaveLength(0);
  });
});
