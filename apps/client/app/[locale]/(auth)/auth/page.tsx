import { ROUTES } from '@/shared/constants';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { AuthPage } from '@/views/auth';

export const generateMetadata = () => translatedMetadata({ namespace: 'auth', path: ROUTES.auth });

const Page = () => <AuthPage />;

export default Page;
