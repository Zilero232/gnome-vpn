import { Accordion, Text } from '@/ui-kit';

import type { FaqGroupsProps } from './FaqGroups.types';

import { FaqAnswer } from '../FaqAnswer';

import s from './FaqGroups.module.scss';

export const FaqGroups = ({ groups, open, onOpenChange }: FaqGroupsProps) =>
  groups.map(({ key, title, items }) => (
    <section key={key} aria-labelledby={`faq-${key}`} className={s.group}>
      <Text as='h2' className={s.title} id={`faq-${key}`}>
        {title}
      </Text>
      <Accordion
        items={items.map(({ value, question, answer }) => ({
          value,
          title: question,
          content: <FaqAnswer value={value}>{answer}</FaqAnswer>
        }))}
        value={open}
        onValueChange={onOpenChange}
      />
    </section>
  ));
