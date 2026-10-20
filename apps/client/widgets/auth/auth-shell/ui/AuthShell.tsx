'use client';

import type { FocusEvent } from 'react';

import { useState } from 'react';

import type { AuthShellProps } from './AuthShell.types';

import { AuthScene } from './components';

import s from './AuthShell.module.scss';

export const AuthShell = ({ pose, aside, isEntering = false, children }: AuthShellProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsFocused(false);
    }
  };

  return (
    <div className={s.root}>
      <div className={s.art}>
        <AuthScene className={s.scene} isDoorOpen={isFocused} isEntering={isEntering} pose={pose} />
      </div>

      {aside && <div className={s.aside}>{aside}</div>}

      <div className={s.card} onBlurCapture={onBlur} onFocusCapture={() => setIsFocused(true)}>
        {children}
      </div>
    </div>
  );
};
