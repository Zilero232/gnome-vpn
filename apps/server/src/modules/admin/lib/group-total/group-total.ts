import type { GroupTotal, GroupTotalInput, TotalGroup } from './group-total.types';

export const groupTotal = <Group extends TotalGroup, Key extends keyof Group>({ groups, by, value }: GroupTotalInput<Group, Key>): GroupTotal => {
  const group = groups.find((each) => each[by] === value);

  return { count: group?._count._all ?? 0, amount: group?._sum?.amount?.toNumber() ?? 0 };
};
