import { Suspense } from 'react';

import { ROUTES } from '@/shared/constants';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { AccountPage } from '@/views/account';

export const generateMetadata = () => translatedMetadata({ namespace: 'account', path: ROUTES.account });

const Page = () => (
  <Suspense>
    <AccountPage />
  </Suspense>
);

export default Page;
