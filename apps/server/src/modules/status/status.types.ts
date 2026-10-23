export type RecordUptimeInput = {
  checkedAt: Date;
  nodeIds: string[];
};

export type AddressNodeRow = {
  id: string;
  host: string;
  countryCode: string;
};
