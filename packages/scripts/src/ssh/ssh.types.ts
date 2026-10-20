export type SshConnectOptions = {
  host: string;
  username: string;
  port?: number;
  password?: string;
  privateKeyPath?: string;
};

export type SshExecInput = {
  command: string;
  stdin?: string;
};

export type SshCommand = string | SshExecInput;

export type SshExecResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type SshPutFileInput = {
  content: string;
  remotePath: string;
};
