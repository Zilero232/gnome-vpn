import { clsx } from 'clsx';

import type { StepListProps } from './StepList.types';

import { Text } from '../../atoms';

import s from './StepList.module.scss';

export const StepList = ({ steps, variant = 'plain', className }: StepListProps) => (
  <ol className={clsx(s.root, className)} data-variant={variant}>
    {steps.map(({ key, title, description, aside, children }, index) => (
      <li key={key} className={s.step}>
        <span aria-hidden className={s.index}>
          {index + 1}
        </span>

        <div className={s.body}>
          <div className={s.head}>
            <Text as='h3' className={s.title}>
              {title}
            </Text>

            {aside}
          </div>

          {description && (
            <Text as='p' size='sm' tone='muted'>
              {description}
            </Text>
          )}

          {children}
        </div>
      </li>
    ))}
  </ol>
);
