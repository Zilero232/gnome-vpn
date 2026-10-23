import type { TrimGeoListInput, TrimmedGeoList } from './geo-list.types';

import { entryCode, isEntry, nextRecord } from './geo-list.helpers';

export const trimGeoList = ({ data, codes }: TrimGeoListInput): TrimmedGeoList => {
  const wanted = new Map(codes.map((code) => [code.toUpperCase(), code]));
  const found = new Set<string>();
  const kept: Uint8Array[] = [];
  let offset = 0;

  while (offset < data.length) {
    const record = nextRecord({ data, offset, end: data.length });
    const code = isEntry(record) ? entryCode({ data, start: record.valueStart, end: record.valueEnd })?.toUpperCase() : undefined;

    if (code !== undefined && wanted.has(code)) {
      kept.push(data.subarray(record.start, record.end));
      found.add(code);
    }

    offset = record.end;
  }

  return {
    data: Buffer.concat(kept),
    missing: [...wanted].filter(([upper]) => !found.has(upper)).map(([, code]) => code)
  };
};
