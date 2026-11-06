'use client';

import { ChevronDown } from 'lucide-react';
import { isNonNullish } from 'remeda';

import type { FilterSelectProps } from './FilterSelect.types';

import { FILTER_SELECT } from './FilterSelect.constants';

import s from './FilterSelect.module.scss';

export const FilterSelect = <Value extends string>({ id, label, value, options, anyLabel, onChange }: FilterSelectProps<Value>) => {
  const selected = options.find((option) => option.value === value);
  const isNarrowed = isNonNullish(anyLabel) && isNonNullish(selected);

  return (
    <span className={s.root} data-narrowed={isNarrowed}>
      <span aria-hidden className={s.text}>
        <span className={s.label}>{label}</span>
        <span className={s.value}>{selected?.label ?? anyLabel}</span>
      </span>

      <ChevronDown aria-hidden className={s.icon} size={14} />

      <select
        aria-label={label}
        className={s.select}
        id={id}
        value={value ?? FILTER_SELECT.any}
        onChange={(event) => onChange(options.find((option) => option.value === event.target.value)?.value ?? null)}
      >
        {isNonNullish(anyLabel) && <option value={FILTER_SELECT.any}>{anyLabel}</option>}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  );
};
