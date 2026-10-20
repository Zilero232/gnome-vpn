'use client';

import type { KeyboardEvent } from 'react';

import { useBoolean } from '@siberiacancode/reactuse';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import type { PasswordInputProps } from './PasswordInput.types';

import { Input } from '../Input';

import s from './PasswordInput.module.scss';

export const PasswordInput = ({ className, disabled, showLabel, hideLabel, capsLockLabel, onKeyDown, onKeyUp, ...props }: PasswordInputProps) => {
  const [isVisible, toggleVisible] = useBoolean(false);
  const [isCapsLock, setIsCapsLock] = useState(false);

  const readCapsLock = (event: KeyboardEvent<HTMLInputElement>) => setIsCapsLock(event.getModifierState('CapsLock'));

  return (
    <div className={s.root}>
      <Input
        className={clsx(s.input, className)}
        disabled={disabled}
        type={isVisible ? 'text' : 'password'}
        onKeyDown={(event) => {
          readCapsLock(event);
          onKeyDown?.(event);
        }}
        onKeyUp={(event) => {
          readCapsLock(event);
          onKeyUp?.(event);
        }}
        {...props}
      />

      <button
        aria-label={isVisible ? hideLabel : showLabel}
        className={s.toggle}
        disabled={disabled}
        tabIndex={-1}
        type='button'
        onClick={() => toggleVisible()}
      >
        {isVisible ? <EyeOff className={s.icon} /> : <Eye className={s.icon} />}
      </button>

      {capsLockLabel && isCapsLock && (
        <span className={s.caps} role='status'>
          {capsLockLabel}
        </span>
      )}
    </div>
  );
};
