import { match } from 'ts-pattern';

import type { ProtoCursor, ProtoRecord, ProtoSpan, Varint } from './geo-list.types';

import { FIXED_BYTES, GEO_LIST, VARINT, WIRE_KEY, WIRE_TYPE } from './geo-list.constants';

export const readVarint = ({ data, offset, end }: ProtoCursor): Varint => {
  const last = Math.min(end, offset + VARINT.maxBytes);
  let value = 0;
  let scale = 1;

  for (let cursor = offset; cursor < last; cursor += 1) {
    const byte = data[cursor];

    value += (byte & VARINT.payloadMask) * scale;

    if ((byte & VARINT.continueBit) === 0) {
      return { value, next: cursor + 1 };
    }

    scale *= VARINT.base;
  }

  throw new Error(`truncated varint at byte ${offset}`);
};

export const nextRecord = ({ data, offset, end }: ProtoCursor): ProtoRecord => {
  const key = readVarint({ data, offset, end });
  const field = Math.floor(key.value / WIRE_KEY.typeModulus);
  const wireType = key.value % WIRE_KEY.typeModulus;

  const [valueStart, valueEnd] = match(wireType)
    .with(WIRE_TYPE.varint, () => [key.next, readVarint({ data, offset: key.next, end }).next])
    .with(WIRE_TYPE.lengthDelimited, () => {
      const length = readVarint({ data, offset: key.next, end });

      return [length.next, length.next + length.value];
    })
    .with(WIRE_TYPE.fixed64, WIRE_TYPE.fixed32, (fixed) => [key.next, key.next + FIXED_BYTES[fixed]])
    .otherwise(() => {
      throw new Error(`unsupported wire type ${wireType} at byte ${offset}`);
    });

  if (valueEnd > end) {
    throw new Error(`field ${field} at byte ${offset} runs past its message`);
  }

  return { field, wireType, start: offset, valueStart, valueEnd, end: valueEnd };
};

export const isEntry = (record: ProtoRecord): boolean => record.field === GEO_LIST.entryField && record.wireType === WIRE_TYPE.lengthDelimited;

export const entryCode = ({ data, start, end }: ProtoSpan): string | null => {
  let offset = start;

  while (offset < end) {
    const record = nextRecord({ data, offset, end });

    if (record.field === GEO_LIST.codeField && record.wireType === WIRE_TYPE.lengthDelimited) {
      return new TextDecoder().decode(data.subarray(record.valueStart, record.valueEnd));
    }

    offset = record.end;
  }

  return null;
};
