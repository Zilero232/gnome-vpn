import { SectionHead } from '@/ui-kit';

import type { CardSectionProps } from './CardSection.types';

import s from './CardSection.module.scss';

export const CardSection = ({ title, description, actions, children }: CardSectionProps) => (
  <section className={s.root}>
    <SectionHead actions={actions} description={description} level='h3' title={title} />

    {children}
  </section>
);
