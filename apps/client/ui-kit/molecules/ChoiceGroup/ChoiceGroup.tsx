'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { clsx } from 'clsx';
import { useId } from 'react';

import type { ChoiceGroupProps } from './ChoiceGroup.types';

import { Text } from '../../atoms';

import s from './ChoiceGroup.module.scss';

export const ChoiceGroup = <T extends string>({
  value,
  options,
  label,
  labelAs = 'span',
  layout = 'tiles',
  columns = 3,
  className,
  onChange
}: ChoiceGroupProps<T>) => {
  const id = useId();

  const labelId = `${id}-label`;

  return (
    <div className={clsx(s.root, className)}>
      <Text as={labelAs} className={s.caption} id={labelId}>
        {label}
      </Text>

      <RadioGroup
        aria-labelledby={labelId}
        className={s.options}
        data-columns={columns}
        data-layout={layout}
        value={value}
        onValueChange={(next) => onChange(next)}
      >
        {options.map(({ value: optionValue, label: optionLabel, description, icon, badge, isDisabled }) => {
          const nameId = `${id}-${optionValue}`;
          const hintId = `${nameId}-hint`;

          return (
            <Radio.Root
              key={optionValue}
              aria-describedby={description ? hintId : undefined}
              aria-labelledby={nameId}
              className={s.option}
              disabled={isDisabled}
              value={optionValue}
            >
              {icon && (
                <span aria-hidden className={s.icon}>
                  {icon}
                </span>
              )}

              <span className={s.text}>
                <span className={s.label} id={nameId}>
                  {optionLabel} {badge}
                </span>

                {description && (
                  <span className={s.description} id={hintId}>
                    {description}
                  </span>
                )}
              </span>

              {layout === 'cards' && <span aria-hidden className={s.mark} />}
            </Radio.Root>
          );
        })}
      </RadioGroup>
    </div>
  );
};
