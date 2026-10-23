import { isNonNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { RedemptionState, RedemptionStateInput } from './redemption-state.types';

export const redemptionState = ({ kind, consumedAt, replacedAt }: RedemptionStateInput): RedemptionState =>
  match({ isDiscount: kind === 'discount', isConsumed: isNonNullish(consumedAt), isReplaced: isNonNullish(replacedAt) })
    .returnType<RedemptionState>()
    .with({ isDiscount: false }, () => 'applied')
    .with({ isConsumed: true }, () => 'consumed')
    .with({ isReplaced: true }, () => 'replaced')
    .otherwise(() => 'pending');
