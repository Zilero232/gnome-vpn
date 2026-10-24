import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

import { AppServiceUnavailableException } from '@/common/exceptions';
import { describeError } from '@/common/lib';
import { env } from '@/config';

import type { SendEmailParams } from './email.types';

import { SMTP_TIMEOUTS } from './email.constants';

const isConfigured = Boolean(env.email.smtp.host && env.email.smtp.user && env.email.from);

const transporter = nodemailer.createTransport({
  host: env.email.smtp.host,
  port: env.email.smtp.port,
  secure: env.email.smtp.secure,
  auth: { user: env.email.smtp.user, pass: env.email.smtp.password },
  ...SMTP_TIMEOUTS
});

export const sendEmail = async ({ to, subject, react, unsubscribeUrl }: SendEmailParams): Promise<void> => {
  if (isPlaceholderEmail(to)) {
    return;
  }

  if (!isConfigured) {
    throw new AppServiceUnavailableException('EMAIL_UNAVAILABLE', 'Email is not configured: set SMTP_HOST, SMTP_USER and EMAIL_FROM');
  }

  const recipient = !env.app.isProduction && env.email.devOverride ? env.email.devOverride : to;

  const [html, text] = await Promise.all([render(react), render(react, { plainText: true })]);

  try {
    await transporter.sendMail({
      from: env.email.from,
      to: recipient,
      subject,
      html,
      text,
      ...(unsubscribeUrl && { list: { unsubscribe: unsubscribeUrl } })
    });
  } catch (error) {
    throw new AppServiceUnavailableException('EMAIL_UNAVAILABLE', `Failed to send email: ${describeError(error)}`);
  }
};
