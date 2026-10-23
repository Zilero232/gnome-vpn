import { keys } from 'remeda';
import { describe, expect, it } from 'vitest';

import { LOCALES, messages } from '@/shared/i18n';

import { TERMS_SECTIONS } from '../terms';

describe('TERMS_SECTIONS', () => {
  it('renders every section the messages hold, so no part of the offer is left off the page', () => {
    for (const locale of LOCALES) {
      expect(keys(messages[locale].terms.sections).sort()).toEqual(TERMS_SECTIONS.map(({ key }) => key).sort());
    }
  });

  it('numbers exactly the clauses each section has, in every language', () => {
    for (const locale of LOCALES) {
      for (const { key, clauses } of TERMS_SECTIONS) {
        expect(messages[locale].terms.sections[key].clauses, `${locale}.${key}`).toHaveLength(clauses);
      }
    }
  });
});
