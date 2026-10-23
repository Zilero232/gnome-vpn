import { keys } from 'remeda';
import { describe, expect, it } from 'vitest';

import { LOCALES, messages } from '@/shared/i18n';

import { CONSENT_SECTIONS } from '../consent';

describe('CONSENT_SECTIONS', () => {
  it('renders every section the messages hold, so no part of the consent is left off the page', () => {
    for (const locale of LOCALES) {
      expect(keys(messages[locale].consent.sections).sort()).toEqual(CONSENT_SECTIONS.map(({ key }) => key).sort());
    }
  });

  it('lists exactly the items each section has, in every language', () => {
    for (const locale of LOCALES) {
      for (const { key, items } of CONSENT_SECTIONS) {
        const section = messages[locale].consent.sections[key];

        expect('items' in section ? section.items : [], `${locale}.${key}`).toHaveLength(items);
      }
    }
  });
});
