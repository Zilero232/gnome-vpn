'use client';

import { Tabs } from '@base-ui/react/tabs';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

import type { PageTabsProps } from './PageTabs.types';

import { PILL_MOTION, TAB_PANEL_MOTION } from './PageTabs.motion';
import { usePageTabs } from './use-page-tabs';

import s from './PageTabs.module.scss';

export const PageTabs = ({ items, label, layout = 'rail', panelClassName }: PageTabsProps) => {
  const { current, navRef, tabsRef, pillId, edges, isVertical, select } = usePageTabs({ items, layout });

  return (
    <Tabs.Root
      className={s.root}
      data-layout={layout}
      orientation={isVertical ? 'vertical' : 'horizontal'}
      value={current?.value ?? null}
      onValueChange={select}
    >
      <div className={s.navWrap} data-more-end={edges.end} data-more-start={edges.start}>
        <Tabs.List activateOnFocus ref={navRef} aria-label={label} className={s.nav} tabIndex={-1}>
          {items.map(({ value, label: tabLabel, icon: Icon }, index) => (
            <Tabs.Tab
              key={value}
              ref={(node) => {
                tabsRef.current[index] = node;
              }}
              className={s.tab}
              value={value}
            >
              {value === current?.value && <motion.span aria-hidden className={s.pill} layoutId={pillId} transition={PILL_MOTION} />}

              <span className={s.label}>
                <Icon aria-hidden size={16} />
                {tabLabel}
              </span>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <span aria-hidden className={s.more} data-side='start'>
          <ChevronLeft size={16} />
        </span>

        <span aria-hidden className={s.more} data-side='end'>
          <ChevronRight size={16} />
        </span>
      </div>

      {current && (
        <Tabs.Panel
          key={current.value}
          className={clsx(s.panel, panelClassName)}
          render={<motion.section animate='visible' initial='hidden' variants={TAB_PANEL_MOTION} />}
          value={current.value}
        >
          {current.render()}
        </Tabs.Panel>
      )}
    </Tabs.Root>
  );
};
