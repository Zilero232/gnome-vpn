export type NodeAddress = {
  address: string;
  countryCode: string;
};

export type CountryForIpInput = {
  addresses: NodeAddress[];
  ip: string;
};

export type MappedIpv4Input = {
  high: string;
  low: string;
};
