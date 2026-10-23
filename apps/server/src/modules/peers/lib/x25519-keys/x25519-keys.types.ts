export type X25519KeyPair = {
  privateKey: string;
  publicKey: string;
};

export type PublicKeyInput = {
  privateKey: string;
  encoding: BufferEncoding;
};
