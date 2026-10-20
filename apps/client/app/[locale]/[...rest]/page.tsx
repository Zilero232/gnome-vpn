import { notFound } from 'next/navigation';

import { LOCALES } from '@/shared/i18n';

export const ensureStatic = 'navigation';

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale, rest: ['404'] }));

const UnknownPage = () => notFound();

export default UnknownPage;
