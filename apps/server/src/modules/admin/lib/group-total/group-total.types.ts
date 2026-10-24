import type { Prisma } from '@/generated';

export type TotalGroup = {
  _count: { _all: number };
  _sum?: { amount?: Prisma.Decimal | null };
};

export type GroupTotalInput<Group extends TotalGroup, Key extends keyof Group> = {
  groups: Group[];
  by: Key;
  value: NoInfer<Group[Key]>;
};

export type GroupTotal = {
  count: number;
  amount: number;
};
