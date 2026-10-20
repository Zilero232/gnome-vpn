import { useTranslations } from 'next-intl';

import { usePlatforms } from '@/entities/app/incy';
import { WireguardApps } from '@/features/vpn/wireguard-config';
import { ACCOUNT_TAB, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { LinkCard, Tabs, Text } from '@/ui-kit';

import { SETUP_PLATFORMS, SETUP_STEPS, SETUP_WAYS, WIREGUARD_SETUP_PLATFORMS, WIREGUARD_SETUP_STEPS } from '../config';
import { OtherClients, SetupSteps } from './components';

import s from './SetupPage.module.scss';

export const SetupPage = () => {
  const t = useTranslations('setup');
  const tIncy = useTranslations('incy');
  const platforms = usePlatforms();

  return (
    <main className={s.root}>
      <header className={s.head}>
        <Text as='h1' className={s.title}>
          {t('title')}
        </Text>

        <Text as='p' className={s.intro} tone='muted'>
          {t('intro')}
        </Text>
      </header>

      <nav aria-label={t('ways.title')}>
        <ul className={s.ways}>
          {SETUP_WAYS.map(({ id, icon: Icon, isRecommended }) => (
            <li key={id}>
              <a className={s.way} data-recommended={isRecommended} href={`#${id}`}>
                <span className={s.wayHead}>
                  <Icon aria-hidden className={s.wayIcon} size={20} />
                  {isRecommended && <span className={s.wayBadge}>{t('ways.recommended')}</span>}
                </span>

                <span className={s.wayTitle}>{t(`ways.${id}.title`)}</span>
                <span className={s.wayBody}>{t(`ways.${id}.body`)}</span>
                <span className={s.wayGo}>
                  {t('ways.go')} <span aria-hidden>↓</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className={s.section} id='incy'>
        <Text as='h2' className={s.sectionTitle}>
          {t('incy.title')}
        </Text>

        <Text as='p' className={s.sectionIntro} size='sm' tone='muted'>
          {t('incy.intro')}
        </Text>

        <Text as='h3' className={s.subTitle}>
          {t('downloadTitle')}
        </Text>

        <div className={s.grid}>
          {platforms.map(({ id, icon, href }) => (
            <LinkCard key={id} hint={tIncy(`downloads.${id}`)} href={href} icon={icon} label={tIncy(`platforms.${id}`)} />
          ))}
        </div>

        <Text as='h3' className={s.subTitle}>
          {t('stepsTitle')}
        </Text>

        <Tabs
          items={SETUP_PLATFORMS.map((platform) => ({
            value: platform,
            label: t(`platforms.${platform}.name`),
            content: (
              <SetupSteps
                steps={SETUP_STEPS.map((step) => ({
                  key: step,
                  title: t(`steps.${step}.title`),
                  body: t(`platforms.${platform}.${step}`)
                }))}
              />
            )
          }))}
        />
      </section>

      <section className={s.section} id='apps'>
        <Text as='h2' className={s.sectionTitle}>
          {t('other.title')}
        </Text>

        <OtherClients />
      </section>

      <section className={s.section} id='wireguard'>
        <Text as='h2' className={s.sectionTitle}>
          {t('wireguard.title')}
        </Text>

        <Text as='p' className={s.sectionIntro} size='sm' tone='muted'>
          {t('wireguard.intro')}
        </Text>

        <WireguardApps />

        <Text as='h3' className={s.subTitle}>
          {t('wireguard.stepsTitle')}
        </Text>

        <Tabs
          items={WIREGUARD_SETUP_PLATFORMS.map((platform) => ({
            value: platform,
            label: t(`wireguard.platforms.${platform}.name`),
            content: (
              <SetupSteps
                steps={WIREGUARD_SETUP_STEPS.map((step) => ({
                  key: step,
                  title: t(`wireguardSteps.${step}`),
                  body: t(`wireguard.platforms.${platform}.${step}`)
                }))}
              />
            )
          }))}
        />

        <Link className={s.wireguardLink} href={`${ROUTES.account}#${ACCOUNT_TAB.wireguard}`}>
          {t('wireguard.cta')}
        </Link>
      </section>
    </main>
  );
};
