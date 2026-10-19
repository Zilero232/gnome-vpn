export type NodeCredentials = {
  password: string;
  panelPath: string;
  apiToken: string | null;
};

export type ResolveNodeCredentialsInput = {
  envFilePath: string;
  countryCode: string;
};
