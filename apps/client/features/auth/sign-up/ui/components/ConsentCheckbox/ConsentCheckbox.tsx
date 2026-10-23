'use client';

import { useId } from 'react';
import { useController } from 'react-hook-form';

import { Checkbox, Text } from '@/ui-kit';

import type { ConsentCheckboxProps } from './ConsentCheckbox.types';

import s from './ConsentCheckbox.module.scss';

export const ConsentCheckbox = ({ control, name, children, error }: ConsentCheckboxProps) => {
  const { field } = useController({ control, name });
  const errorId = useId();

  return (
    <div className={s.root}>
      <label className={s.label}>
        <Checkbox
          ref={field.ref}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          checked={field.value}
          className={s.box}
          name={field.name}
          onBlur={field.onBlur}
          onCheckedChange={field.onChange}
        />

        <span>{children}</span>
      </label>

      {error && (
        <Text id={errorId} role='alert' size='xs' tone='danger'>
          {error}
        </Text>
      )}
    </div>
  );
};
