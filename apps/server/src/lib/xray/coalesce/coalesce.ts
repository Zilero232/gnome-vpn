import { isNullish } from 'remeda';

import type { CoalesceByKeyInput, CoalesceSlot } from './coalesce.types';

const slots = new Map<string, CoalesceSlot>();

const start = ({ key, task }: CoalesceByKeyInput): Promise<void> => {
  const running = task();
  const slot: CoalesceSlot = { running, next: null };

  slots.set(key, slot);

  void running
    .catch(() => undefined)
    .finally(() => {
      if (slots.get(key) === slot && isNullish(slot.next)) {
        slots.delete(key);
      }
    });

  return running;
};

export const coalesceByKey = ({ key, task }: CoalesceByKeyInput): Promise<void> => {
  const slot = slots.get(key);

  if (isNullish(slot)) {
    return start({ key, task });
  }

  slot.next ??= slot.running.catch(() => undefined).then(() => start({ key, task }));

  return slot.next;
};
