import { Suspense } from 'react';

import { ROUTES } from '@/shared/constants';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { UnsubscribePage } from '@/views/unsubscribe';

export const generateMetadata = () => translatedMetadata({ namespace: 'unsubscribe', path: ROUTES.unsubscribe });

const Page = () => (
  <Suspense>
    <UnsubscribePage />
  </Suspense>
);

export default Page;
