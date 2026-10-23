import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { isNullish, isTruthy } from 'remeda';

import type { SupportHeaderInput } from './support-header.types';

import { BOT_TEXT, NEW_LINE } from '../../config';
import { resolveLocale } from '../bot-locale';
import { fillText } from '../fill-text';
import { accessLine } from './support-header.helpers';

export const supportHeader = ({ sender, account, locale }: SupportHeaderInput): string => {
  const text = BOT_TEXT[locale];
  const name = [sender.first_name, sender.last_name].filter(isTruthy).join(' ');
  const who = isNullish(sender.username) ? name : `${name} @${sender.username}`;
  const title = fillText({ text: text.supportHeader, fill: { name: who, id: String(sender.id) } });

  if (isNullish(account)) {
    return [title, fillText({ text: text.supportNoAccount, fill: { locale: resolveLocale(sender.language_code) } })].join(NEW_LINE);
  }

  const contact = fillText({
    text: text.supportAccount,
    fill: {
      email: isPlaceholderEmail(account.email) ? text.supportNoEmail : account.email,
      locale: account.locale,
      count: String(account.deviceCount)
    }
  });

  return [title, contact, accessLine({ account, locale })].join(NEW_LINE);
};
