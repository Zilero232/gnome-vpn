import { Link } from '@/shared/i18n/navigation';

import type { LegalLinkProps } from './LegalLink.types';

import s from './LegalLink.module.scss';

export const LegalLink = ({ href, children }: LegalLinkProps) => (
  <Link className={s.root} href={href}>
    {children}
  </Link>
);
