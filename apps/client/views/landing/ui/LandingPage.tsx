import { Suspense } from 'react';

import { ConnectSteps, Faq, GnomeNote, Hero, HomePricing, ServersInside } from './components';

import s from './LandingPage.module.scss';

const DEFERRED_SECTIONS = [ConnectSteps, HomePricing, ServersInside, GnomeNote, Faq];

export const LandingPage = () => (
  <main className={s.root}>
    <Hero />

    {DEFERRED_SECTIONS.map((Section) => (
      <Suspense key={Section.name}>
        <Section />
      </Suspense>
    ))}
  </main>
);
