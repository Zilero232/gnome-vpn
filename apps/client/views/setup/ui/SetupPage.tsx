import { useTranslations } from 'next-intl';

import { PageIntro } from '@/widgets/site/page-intro';

import { SetupBrowser, SetupWays } from './components';

import s from './SetupPage.module.scss';

export const SetupPage = () => {
  const t = useTranslations('setup');

  return (
    <main className={s.root}>
      <PageIntro intro={t('intro')} title={t('title')} />

      <div className={s.layout}>
        <SetupWays />

        <SetupBrowser />
      </div>
    </main>
  );
};
