import type { PrismaExecutor } from '../prisma';
import type { NOTICE_CLAIM } from './notice-log.constants';

type Claims = typeof NOTICE_CLAIM;

export type NoticeClaim = Claims['winBackTouch'][keyof Claims['winBackTouch']] | Exclude<Claims[keyof Claims], Claims['winBackTouch']>;

export type ClaimNoticeInput = {
  db: PrismaExecutor;
  userId: string;
  notice: NoticeClaim;
  ref: string;
  sentAt?: Date;
};
