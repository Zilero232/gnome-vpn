import type { Prisma } from '@/generated';

export type OwnersOfInput = {
  state?: Prisma.PeerWhereInput['state'];
  user: Prisma.UserWhereInput;
};

export type SweepInput = {
  act: (userId: string) => Promise<number>;
  state?: Prisma.PeerWhereInput['state'];
  user: Prisma.UserWhereInput;
};
