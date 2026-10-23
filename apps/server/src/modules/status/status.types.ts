export type RecordUptimeInput = {
  checkedAt: Date;
  nodeIds: string[];
};

export type AddressNodeRow = {
  id: string;
  host: string;
  countryCode: string;
};

export type NodeLookup = {
  countryCode: string;
  addresses: string[];
};
