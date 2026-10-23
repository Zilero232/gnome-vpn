import { clsx } from 'clsx';

import type { PanelProps } from './Panel.types';

import { Text } from '../../atoms';

import s from './Panel.module.scss';

export const Panel = ({ title, caption, actions, isFaded = false, className, children }: PanelProps) => (
  <section aria-busy={isFaded} className={clsx(s.root, className)} data-faded={isFaded}>
    <header className={s.head}>
      <div className={s.titles}>
        <Text as='h3' className={s.title}>
          {title}
        </Text>

        {caption && (
          <Text as='p' size='xs' tone='muted'>
            {caption}
          </Text>
        )}
      </div>

      {actions && <div className={s.actions}>{actions}</div>}
    </header>

    {children}
  </section>
);
