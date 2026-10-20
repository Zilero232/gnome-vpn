'use client';

import { motion } from 'motion/react';

import { IN_VIEW, REVEAL, STAGGER } from '@/shared/lib';

import type { RevealProps } from './Reveal.types';

export const Reveal = ({ as = 'div', kind = 'single', className, children }: RevealProps) => {
  const Tag = motion[as];

  if (kind === 'item') {
    return (
      <Tag className={className} variants={REVEAL}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag className={className} initial='hidden' variants={kind === 'group' ? STAGGER : REVEAL} viewport={IN_VIEW} whileInView='visible'>
      {children}
    </Tag>
  );
};
