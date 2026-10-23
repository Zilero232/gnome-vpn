import { isNonNullish } from 'remeda';

import { Text } from '@/ui-kit';

import type { AuthAsideProps } from './AuthAside.types';

import s from './AuthAside.module.scss';

export const AuthAside = ({ title, body, children }: AuthAsideProps) => (
  <div className={s.root}>
    <Text as='p' className={s.title}>
      {title}
    </Text>
    {isNonNullish(body) && (
      <Text as='p' className={s.body}>
        {body}
      </Text>
    )}
    {children}
  </div>
);
