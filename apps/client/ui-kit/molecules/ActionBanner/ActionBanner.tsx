import type { ActionBannerProps } from './ActionBanner.types';

import { Text } from '../../atoms';
import { SubmitButton } from '../SubmitButton';
import { actionBanner } from './ActionBanner.variants';

import s from './ActionBanner.module.scss';

export const ActionBanner = ({
  icon: Icon,
  title,
  text,
  actionLabel,
  isPending = false,
  tone = 'accent',
  className,
  onAction
}: ActionBannerProps) => (
  <div className={actionBanner({ tone, class: className })}>
    <span aria-hidden className={s.icon}>
      <Icon size={22} />
    </span>

    <div className={s.body}>
      <Text as='h2' className={s.title}>
        {title}
      </Text>

      <Text as='p' className={s.text}>
        {text}
      </Text>
    </div>

    <SubmitButton className={s.action} isPending={isPending} size='md' type='button' onClick={onAction}>
      {actionLabel}
    </SubmitButton>
  </div>
);
