import { Text } from '@/ui-kit';

import type { AuthAsideProps } from './AuthAside.types';

import s from './AuthAside.module.scss';

export const AuthAside = ({ title, body }: AuthAsideProps) => (
  <div className={s.root}>
    <Text as='p' className={s.title}>
      {title}
    </Text>
    <Text as='p' className={s.body}>
      {body}
    </Text>
  </div>
);
