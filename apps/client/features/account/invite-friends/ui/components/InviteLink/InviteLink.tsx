'use client';

import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import type { InviteLinkProps } from './InviteLink.types';

import { useCopyLink } from '../../../model/hooks';

import s from './InviteLink.module.scss';

export const InviteLink = ({ label, url }: InviteLinkProps) => {
  const t = useTranslations('referrals');
  const copy = useCopyLink();
  const id = useId();

  return (
    <div className={s.root}>
      <label className={s.label} htmlFor={id}>
        {label}
      </label>

      <div className={s.field}>
        <input readOnly className={s.url} id={id} value={url} onFocus={(event) => event.currentTarget.select()} />

        <button aria-label={t('copyField', { label })} className={s.copy} title={t('copy')} type='button' onClick={() => void copy(url)}>
          <Copy aria-hidden size={16} />
        </button>
      </div>
    </div>
  );
};
