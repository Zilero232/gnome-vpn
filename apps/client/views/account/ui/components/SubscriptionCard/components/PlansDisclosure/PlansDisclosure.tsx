'use client';

import { useMount } from '@siberiacancode/reactuse';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { planFromSearch, PlanPicker } from '@/features/billing/checkout';

import s from './PlansDisclosure.module.scss';

export const PlansDisclosure = () => {
  const t = useTranslations('account');
  const id = useId();

  const [isOpen, setIsOpen] = useState(false);

  useMount(() => {
    if (planFromSearch(window.location.search)) {
      setIsOpen(true);
    }
  });

  return (
    <div className={s.root}>
      <button aria-controls={id} aria-expanded={isOpen} className={s.toggle} type='button' onClick={() => setIsOpen((open) => !open)}>
        {t('subscribeNow')}
        <ChevronDown aria-hidden className={s.chevron} size={16} />
      </button>

      <div className={s.panel} hidden={!isOpen} id={id}>
        {isOpen && <PlanPicker />}
      </div>
    </div>
  );
};
