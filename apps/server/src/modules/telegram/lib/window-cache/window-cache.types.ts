export type WindowEntry<T> = {
  at: number;
  value: T;
};

export type WindowTakeInput<T> = {
  key: string;
  now?: number;
  create: () => T;
};

export type WindowCache<T> = {
  take: (input: WindowTakeInput<T>) => T;
  forget: (key: string) => void;
};
