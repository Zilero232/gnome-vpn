import { clsx } from 'clsx';
import { range } from 'remeda';

import type { AccountSkeletonProps } from './AccountSkeleton.types';

import { ACCOUNT_SKELETON } from './AccountSkeleton.constants';

import s from './AccountSkeleton.module.scss';

export const AccountSkeleton = ({ label, className }: AccountSkeletonProps) => (
  <div aria-busy aria-label={label} className={clsx(s.root, className)} role='status'>
    <div className={s.inner}>
      <div className={s.header}>
        <span className={clsx(s.bone, s.avatar)} />
        <div className={s.who}>
          <span className={clsx(s.bone, s.title)} />
          <span className={clsx(s.bone, s.email)} />
        </div>
      </div>

      <div className={s.body}>
        <div className={s.tabs}>
          {range(0, ACCOUNT_SKELETON.tabs).map((index) => (
            <span key={index} className={clsx(s.bone, s.tab)} />
          ))}
        </div>

        <div className={s.card}>
          <span className={clsx(s.bone, s.cardTitle)} />
          <span className={clsx(s.bone, s.line)} />
          <span className={clsx(s.bone, s.block)} />
          <span className={clsx(s.bone, s.button)} />
        </div>
      </div>
    </div>
  </div>
);
