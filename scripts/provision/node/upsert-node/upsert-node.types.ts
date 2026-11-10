import type { basePrisma } from '../../../../apps/server/src/core';

export type PrismaLike = typeof basePrisma;

export type UpsertNodeInput = {
  country: string;
  countryCode: string;
  host: string;
  port: number;
  serverName: string;
  certFingerprint: string | null;
  realityPublicKey: string;
  realityShortId: string;
  wgPublicKey: string;
  apiUrl: string;
  apiTokenEnvVar: string;
  displayOrder: number;
};

export type UpsertNodeResult = {
  id: string;
  wasExisting: boolean;
};

export type UpsertNodeArgs = {
  prisma: PrismaLike;
  input: UpsertNodeInput;
};
