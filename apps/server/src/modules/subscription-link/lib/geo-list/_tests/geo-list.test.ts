import { BinaryWriter, WireType } from '@bufbuild/protobuf/wire';
import { describe, expect, it } from 'vitest';

import { trimGeoList } from '../geo-list';

type EntryInput = {
  code: string;
  domains?: string[];
  leading?: Uint8Array;
};

const entry = ({ code, domains = [], leading = new Uint8Array() }: EntryInput): Uint8Array => {
  const writer = new BinaryWriter().tag(1, WireType.LengthDelimited).fork().raw(leading).tag(1, WireType.LengthDelimited).string(code);

  for (const domain of domains) {
    writer.tag(2, WireType.LengthDelimited).fork().tag(2, WireType.LengthDelimited).string(domain).join();
  }

  return writer.join().finish();
};

const RU = entry({ code: 'CATEGORY-RU', domains: ['yandex.ru', 'vk.com'] });
const ADS = entry({ code: 'CATEGORY-ADS-ALL', domains: Array.from({ length: 200 }, (_, index) => `ads${index}.example`) });
const PRIVATE = entry({ code: 'PRIVATE', domains: ['lan'] });

const list = (...entries: Uint8Array[]): Uint8Array => Buffer.concat(entries);

describe('trimGeoList', () => {
  it('keeps only the wanted entries, byte for byte and in upstream order', () => {
    const trimmed = trimGeoList({ data: list(RU, ADS, PRIVATE), codes: ['PRIVATE', 'CATEGORY-RU'] });

    expect([...trimmed.data]).toEqual([...RU, ...PRIVATE]);
    expect(trimmed.missing).toEqual([]);
  });

  it('matches the lower-case tags of a profile against the upper-case codes upstream stores', () => {
    const trimmed = trimGeoList({ data: list(RU, ADS, PRIVATE), codes: ['category-ru'] });

    expect([...trimmed.data]).toEqual([...RU]);
  });

  it('names every wanted tag the upstream file lacks, as the profile spells it', () => {
    expect(trimGeoList({ data: list(RU), codes: ['category-ru', 'category-gov-ru'] }).missing).toEqual(['category-gov-ru']);
  });

  it('finds the code when other fields come first in the entry', () => {
    const leading = new BinaryWriter()
      .tag(3, WireType.Varint)
      .uint32(300)
      .tag(68_000, WireType.LengthDelimited)
      .string('/path')
      .tag(4, WireType.Bit32)
      .fixed32(1)
      .tag(5, WireType.Bit64)
      .fixed64(1)
      .finish();

    const odd = entry({ code: 'RU', leading });

    expect([...trimGeoList({ data: list(ADS, odd), codes: ['ru'] }).data]).toEqual([...odd]);
  });

  it('skips top-level fields that are not entries', () => {
    const stray = new BinaryWriter().tag(2, WireType.Varint).uint32(7).finish();

    expect([...trimGeoList({ data: list(stray, RU), codes: ['category-ru'] }).data]).toEqual([...RU]);
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
