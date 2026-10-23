import { clsx } from 'clsx';

import type { SectionHeadProps } from './SectionHead.types';

import { Text } from '../../atoms';

import s from './SectionHead.module.scss';

export const SectionHead = ({ title, description, actions, level = 'h2', className }: SectionHeadProps) => (
  <header className={clsx(s.root, className)}>
    <div className={s.text}>
      <Text as={level} className={s.title} data-level={level}>
        {title}
      </Text>

      {description && (
        <Text as='p' size='sm' tone='muted'>
          {description}
        </Text>
      )}
    </div>

    {actions && <div className={s.actions}>{actions}</div>}
  </header>
);
