import { render } from '@react-email/render';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import type { EmailActionKey } from '../../email-text';

import { EMAIL_LOCALE } from '../../email-locale/email-locale.constants';
import { EMAIL_TEXT, fillEmail } from '../../email-text';
import { ActionEmail } from '../ActionEmail';

const URL = 'https://api.gnome-vpn.com/auth/verify?token=abc';
const FILL = { email: 'new@example.com' };
const COPIES: EmailActionKey[] = ['verify', 'reset', 'change'];

describe('ActionEmail', () => {
  for (const locale of EMAIL_LOCALE.all) {
    for (const copy of COPIES) {
      it(`renders the ${copy} copy in ${locale} with its button`, async () => {
        const text = await render(createElement(ActionEmail, { copy, url: URL, fill: FILL, locale }), { plainText: true });

        for (const paragraph of EMAIL_TEXT[locale][copy].body) {
          expect(text).toContain(fillEmail({ text: paragraph, fill: FILL }));
        }

        expect(text).toContain(`${EMAIL_TEXT[locale][copy].action} ${URL}`);
        expect(text).not.toMatch(/\{\w+\}/);
      });
    }
  }
});
