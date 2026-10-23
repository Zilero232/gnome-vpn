export type TrimGeoListInput = {
  data: Uint8Array;
  codes: readonly string[];
};

export type TrimmedGeoList = {
  data: Buffer;
  missing: string[];
};

export type ProtoCursor = {
  data: Uint8Array;
  offset: number;
  end: number;
};

export type ProtoSpan = {
  data: Uint8Array;
  start: number;
  end: number;
};

export type Varint = {
  value: number;
  next: number;
};

export type ProtoRecord = {
  field: number;
  wireType: number;
  start: number;
  valueStart: number;
  valueEnd: number;
  end: number;
};
