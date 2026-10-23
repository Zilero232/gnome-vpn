import type { PluralizeInput } from './pluralize.types';

import { DEFAULT_PLURAL_LOCALE } from './pluralize.constants';

export const pluralize = ({ count, forms, locale = DEFAULT_PLURAL_LOCALE }: PluralizeInput): string =>
  forms[new Intl.PluralRules(locale).select(count)] ?? forms.many;
