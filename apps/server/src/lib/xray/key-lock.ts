import { isNullish } from 'remeda';

import type { CoalesceSlot, KeyedTaskInput } from './xray.types';

const chains = new Map<string, Promise<unknown>>();

const slots = new Map<string, CoalesceSlot>();

export const serializeByKey = <T>({ key, task }: KeyedTaskInput<T>): Promise<T> => {
  const previous = chains.get(key) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);

  const tail: Promise<unknown> = next
    .catch(() => undefined)
    .finally(() => {
      if (chains.get(key) === tail) {
        chains.delete(key);
      }
    });

  chains.set(key, tail);

  return next;
};

export const pendingChains = (): number => chains.size;

const startCoalesced = ({ key, task }: KeyedTaskInput<void>): Promise<void> => {
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

export const coalesceByKey = ({ key, task }: KeyedTaskInput<void>): Promise<void> => {
  const slot = slots.get(key);

  if (isNullish(slot)) {
    return startCoalesced({ key, task });
  }

  slot.next ??= slot.running.catch(() => undefined).then(() => startCoalesced({ key, task }));

  return slot.next;
};
