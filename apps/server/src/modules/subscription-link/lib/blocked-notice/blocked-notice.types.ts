export type BlockedNoticeClaimInput = {
  stored: string | null;
  noticeAt: Date | null;
  key: string;
  windowStart: Date;
};
