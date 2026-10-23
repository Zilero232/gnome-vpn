import { Suspense } from 'react';

import { ROUTES } from '@/shared/constants';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { TelegramSignInPage } from '@/views/telegram-sign-in';

export const generateMetadata = () =>
  translatedMetadata({ namespace: 'auth', path: ROUTES.telegramSignIn, titleKey: 'meta.telegramTitle', descriptionKey: 'meta.telegramDescription' });

const Page = () => (
  <Suspense>
    <TelegramSignInPage />
  </Suspense>
);

export default Page;
