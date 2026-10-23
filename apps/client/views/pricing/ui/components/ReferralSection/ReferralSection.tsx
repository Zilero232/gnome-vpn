import { MAX_REFERRER_DAYS } from '@gnomevpn/schemas';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { InviteRewards } from '@/features/account/invite-friends';
import { ACCOUNT_TAB, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { buttonVariants, Text } from '@/ui-kit';

import s from './ReferralSection.module.scss';

export const ReferralSection = () => {
  const t = useTranslations('pricing.referral');

  return (
    <section aria-labelledby='referral-title' className={s.root}>
      <div className={s.text}>
        <Text as='h2' className={s.title} id='referral-title'>
          {t('title')}
        </Text>

        <Text as='p' className={s.intro}>
          {t('intro', { days: MAX_REFERRER_DAYS })}
        </Text>

        <Link className={buttonVariants({ variant: 'ghost', class: s.cta })} href={{ pathname: ROUTES.account, hash: ACCOUNT_TAB.invite }}>
          {t('cta')}
          <ArrowRight aria-hidden size={16} />
        </Link>
      </div>

      <InviteRewards />
    </section>
  );
};
