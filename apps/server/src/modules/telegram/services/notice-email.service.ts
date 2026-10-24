import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { createElement } from 'react';
import { isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { EMAIL_TEXT, fillEmail, isEmailNotice, localizedPath, NoticeEmail, pickEmailLocale, sendEmail } from '@/lib/email';
import { UnsubscribeService } from '@/modules/consents';

import type { NoticeEmailInput, NoticeSpec } from '../telegram.types';

import { NOTICE_EMAIL, NOTICES } from '../config';
import { formatDate, resolveLocale } from '../lib';

@Injectable()
export class NoticeEmailService {
  private readonly logger = new Logger(NoticeEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly unsubscribes: UnsubscribeService
  ) {}

  async send({ userId, notice, fill, date }: NoticeEmailInput): Promise<void> {
    if (!isEmailNotice(notice)) {
      return;
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, emailVerified: true, locale: true, telegramAccount: { select: { locale: true, languageCode: true } } }
      });

      if (isNullish(user) || !user.emailVerified || isPlaceholderEmail(user.email)) {
        return;
      }

      const chat = user.telegramAccount;
      const locale = pickEmailLocale([user.locale, isNonNullish(chat) ? resolveLocale(chat.locale ?? chat.languageCode) : null]);
      const tokens = { ...fill, ...(date && { date: formatDate({ iso: date.toISOString(), locale }) }) };
      const url = new URL(localizedPath({ path: NOTICE_EMAIL.path, locale }), this.config.get('app').clientUrl);

      url.hash = NOTICE_EMAIL.tab;

      const spec: NoticeSpec = NOTICES[notice];
      const unsubscribeUrl = spec.isPromotional ? this.unsubscribes.link({ userId, locale }) : undefined;

      await sendEmail({
        to: user.email,
        subject: fillEmail({ text: EMAIL_TEXT[locale].notices[notice].subject, fill: tokens }),
        react: createElement(NoticeEmail, { notice, url: url.toString(), fill: tokens, locale, unsubscribeUrl }),
        unsubscribeUrl
      });
    } catch (error) {
      this.logger.warn(`could not email ${userId} the ${notice} notice: ${describeError(error)}`);
    }
  }
}
