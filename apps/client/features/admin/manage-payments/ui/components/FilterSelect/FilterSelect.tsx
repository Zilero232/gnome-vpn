'use client';

import { FormField, Select } from '@/ui-kit';

import type { FilterSelectProps } from './FilterSelect.types';

export const FilterSelect = <Value extends string>({ id, label, value, options, onChange }: FilterSelectProps<Value>) => (
  <FormField htmlFor={id} label={label}>
    <Select
      id={id}
      value={value}
      onChange={(event) => {
        const picked = options.find((option) => option.value === event.target.value);

        if (picked) {
          onChange(picked.value);
        }
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </FormField>
);
