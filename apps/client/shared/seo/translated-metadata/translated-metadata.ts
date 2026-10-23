import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';

import { resolveLocale } from '@/shared/i18n';

import type { TranslatedMetadataInput } from './translated-metadata.types';

import { createPageMetadata } from '../site-metadata';

export const translatedMetadata = async ({
  namespace,
  path,
  titleKey = 'meta.title',
  descriptionKey = 'meta.description',
  isIndexed = false
}: TranslatedMetadataInput): Promise<Metadata> => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace });

  return createPageMetadata({ title: t(titleKey), description: t(descriptionKey), path, locale, index: isIndexed, follow: isIndexed });
};
