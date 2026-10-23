import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { NotFoundView } from '@/views/not-found';
import { SiteShell } from '@/widgets/site/site-shell';

export const generateMetadata = () => translatedMetadata({ namespace: 'notFound', titleKey: 'code', descriptionKey: 'body' });

const NotFound = () => (
  <SiteShell>
    <NotFoundView />
  </SiteShell>
);

export default NotFound;
