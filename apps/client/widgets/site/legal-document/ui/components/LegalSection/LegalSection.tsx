import { Text } from '@/ui-kit';

import type { LegalSectionProps } from './LegalSection.types';

import s from './LegalSection.module.scss';

export const LegalSection = ({ id, title, children }: LegalSectionProps) => (
  <section className={s.root} id={id}>
    <Text as='h2' className={s.heading}>
      {title}
    </Text>

    <div className={s.body}>{children}</div>
  </section>
);
