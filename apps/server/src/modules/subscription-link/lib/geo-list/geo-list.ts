import { BinaryReader } from '@bufbuild/protobuf/wire';

import type { TrimGeoListInput, TrimmedGeoList } from './geo-list.types';

import { nextEntryCode } from './geo-list.helpers';

export const trimGeoList = ({ data, codes }: TrimGeoListInput): TrimmedGeoList => {
  const wanted = new Map(codes.map((code) => [code.toUpperCase(), code]));
  const found = new Set<string>();
  const kept: Uint8Array[] = [];
  const reader = new BinaryReader(data);

  while (reader.pos < reader.len) {
    const start = reader.pos;
    const code = nextEntryCode(reader);

    if (code !== undefined && wanted.has(code)) {
      kept.push(data.subarray(start, reader.pos));
      found.add(code);
    }
  }

  return {
    data: Buffer.concat(kept),
    missing: [...wanted].filter(([upper]) => !found.has(upper)).map(([, code]) => code)
  };
};
