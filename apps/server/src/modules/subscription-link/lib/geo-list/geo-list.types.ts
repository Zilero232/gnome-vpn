export type TrimGeoListInput = {
  data: Uint8Array;
  codes: readonly string[];
};

export type TrimmedGeoList = {
  data: Buffer;
  missing: string[];
};
