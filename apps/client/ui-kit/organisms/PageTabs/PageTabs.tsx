'use client';

import { clsx } from 'clsx';
import { motion } from 'motion/react';

import type { PageTabsProps } from './PageTabs.types';

import { PILL_MOTION, TAB_PANEL_MOTION } from './PageTabs.motion';
import { usePageTabs } from './use-page-tabs';

import s from './PageTabs.module.scss';

export const PageTabs = ({ items, label, layout = 'rail', panelClassName }: PageTabsProps) => {
  const { current, navRef, tabsRef, tabId, panelId, pillId, select, onKeyDown } = usePageTabs(items);

  return (
    <div className={s.root} data-layout={layout}>
      <div ref={navRef} aria-label={label} className={s.nav} role='tablist' tabIndex={-1} onKeyDown={onKeyDown}>
        {items.map(({ value, label: tabLabel, icon: Icon }, index) => {
          const isActive = value === current?.value;

          return (
            <button
              key={value}
              ref={(node) => {
                tabsRef.current[index] = node;
              }}
              aria-controls={panelId(value)}
              aria-selected={isActive}
              className={s.tab}
              data-active={isActive}
              id={tabId(value)}
              role='tab'
              tabIndex={isActive ? 0 : -1}
              type='button'
              onClick={() => select(value)}
            >
              {isActive && <motion.span aria-hidden className={s.pill} layoutId={pillId} transition={PILL_MOTION} />}

              <span className={s.label}>
                <Icon aria-hidden size={16} />
                {tabLabel}
              </span>
            </button>
          );
        })}
      </div>

      {current && (
        <motion.section
          key={current.value}
          animate='visible'
          aria-labelledby={tabId(current.value)}
          className={clsx(s.panel, panelClassName)}
          id={panelId(current.value)}
          initial='hidden'
          role='tabpanel'
          tabIndex={0}
          variants={TAB_PANEL_MOTION}
        >
          {current.render()}
        </motion.section>
      )}
    </div>
  );
};
