export type NodeAddress = {
  address: string;
  countryCode: string;
};

export type CountryForIpInput = {
  addresses: NodeAddress[];
  ip: string;
};
