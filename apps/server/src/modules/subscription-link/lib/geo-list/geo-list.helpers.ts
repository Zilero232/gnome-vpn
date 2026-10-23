import { BinaryReader, WireType } from '@bufbuild/protobuf/wire';

import { GEO_LIST } from './geo-list.constants';

const entryCode = (entry: Uint8Array): string | undefined => {
  const reader = new BinaryReader(entry);

  while (reader.pos < reader.len) {
    const [field, wireType] = reader.tag();

    if (field === GEO_LIST.codeField && wireType === WireType.LengthDelimited) {
      return reader.string();
    }

    reader.skip(wireType, field);
  }

  return undefined;
};

export const nextEntryCode = (reader: BinaryReader): string | undefined => {
  const [field, wireType] = reader.tag();

  if (field !== GEO_LIST.entryField || wireType !== WireType.LengthDelimited) {
    reader.skip(wireType, field);

    return undefined;
  }

  return entryCode(reader.bytes())?.toUpperCase();
};
