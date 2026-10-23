'use client';

import { isNonNullish } from 'remeda';

import { FormField, Select } from '@/ui-kit';

import type { FilterSelectProps } from './FilterSelect.types';

import { FILTER_SELECT } from './FilterSelect.constants';

export const FilterSelect = <Value extends string>({ id, label, value, options, anyLabel, onChange }: FilterSelectProps<Value>) => (
  <FormField htmlFor={id} label={label}>
    <Select
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
    </Select>
  </FormField>
);
