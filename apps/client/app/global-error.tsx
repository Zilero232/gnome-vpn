'use client';

import { clsx } from 'clsx';

import { fontMono, fontSans, fontSerif, SITE } from '@/shared/config';
import { DEFAULT_LOCALE, messages } from '@/shared/i18n';
import { Button, StatusScreen } from '@/ui-kit';

import 'modern-normalize/modern-normalize.css';
import './globals.scss';

const GlobalError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  const t = messages[DEFAULT_LOCALE].error;

  return (
    <html className={clsx('dark', fontSans.variable, fontSerif.variable, fontMono.variable)} data-scroll-behavior='smooth' lang={SITE.lang}>
      <body>
        <StatusScreen body={t.body} code={t.code} title={t.title} tone='danger'>
          <Button onClick={reset}>{t.retry}</Button>
        </StatusScreen>
      </body>
    </html>
  );
};

export default GlobalError;
