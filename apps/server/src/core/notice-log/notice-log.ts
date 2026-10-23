import type { ClaimNoticeInput } from './notice-log.types';

export const claimNotice = async ({ db, userId, notice, ref, sentAt }: ClaimNoticeInput): Promise<boolean> => {
  const { count } = await db.noticeLog.createMany({ data: [{ userId, notice, ref, sentAt }], skipDuplicates: true });

  return count === 1;
};
