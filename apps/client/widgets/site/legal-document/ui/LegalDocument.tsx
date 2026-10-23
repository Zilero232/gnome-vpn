import { SITE } from '@/shared/config';
import { Text } from '@/ui-kit';

import type { LegalDocumentProps } from './LegalDocument.types';

import { LegalContents } from './components';

import s from './LegalDocument.module.scss';

export const LegalDocument = ({ title, updated, intro, contents, summary, footnote, children }: LegalDocumentProps) => (
  <main className={s.root}>
    <article className={s.article}>
      <header className={s.head}>
        <Text as='h1' className={s.title}>
          {title}
        </Text>

        <Text as='p' className={s.updated}>
          {updated}
        </Text>

        <Text as='p' className={s.intro}>
          {intro}
        </Text>
      </header>

      {summary}

      <div className={s.inlineContents}>
        <LegalContents items={contents} variant='inline' />
      </div>

      {children}

      <footer className={s.footer}>
        <Text as='p' className={s.footnote}>
          {footnote}
        </Text>

        <a className={s.email} href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </footer>
    </article>

    <aside className={s.side}>
      <LegalContents items={contents} variant='aside' />
    </aside>
  </main>
);
