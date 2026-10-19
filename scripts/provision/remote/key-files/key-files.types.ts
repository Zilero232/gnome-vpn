export type KeyFileSeed = {
  path: string;
  value: string;
};

export type SeedKeyFilesScriptInput = {
  dir: string;
  seed: KeyFileSeed[];
};
