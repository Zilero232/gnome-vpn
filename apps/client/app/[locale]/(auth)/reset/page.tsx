import { Suspense } from 'react';

import { ROUTES } from '@/shared/constants';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { ResetPasswordPage } from '@/views/reset-password';

export const generateMetadata = () =>
  translatedMetadata({ namespace: 'auth', path: ROUTES.resetPassword, titleKey: 'meta.resetTitle', descriptionKey: 'meta.resetDescription' });

const Page = () => (
  <Suspense>
    <ResetPasswordPage />
  </Suspense>
);

export default Page;
