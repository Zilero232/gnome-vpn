export const WIRE_TYPE = {
  varint: 0,
  fixed64: 1,
  lengthDelimited: 2,
  fixed32: 5
} as const;

export const WIRE_KEY = {
  typeModulus: 8
} as const;

export const VARINT = {
  payloadMask: 127,
  continueBit: 128,
  base: 128,
  maxBytes: 10
} as const;

export const FIXED_BYTES = {
  [WIRE_TYPE.fixed64]: 8,
  [WIRE_TYPE.fixed32]: 4
} as const;

export const GEO_LIST = {
  entryField: 1,
  codeField: 1
} as const;
