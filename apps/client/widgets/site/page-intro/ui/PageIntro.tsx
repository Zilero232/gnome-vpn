import { clsx } from 'clsx';

import { Text } from '@/ui-kit';

import type { PageIntroProps } from './PageIntro.types';

import s from './PageIntro.module.scss';

export const PageIntro = ({ title, intro, aside, children }: PageIntroProps) => (
  <header className={clsx(s.root, aside && s.withAside)}>
    <div className={s.text}>
      <Text as='h1' className={s.title}>
        {title}
      </Text>
      <Text as='p' className={s.intro}>
        {intro}
      </Text>
      {children}
    </div>

    {aside && (
      <div aria-hidden className={s.aside}>
        {aside}
      </div>
    )}
  </header>
);
