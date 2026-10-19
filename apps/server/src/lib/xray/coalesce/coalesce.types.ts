export type CoalesceByKeyInput = {
  key: string;
  task: () => Promise<void>;
};

export type CoalesceSlot = {
  running: Promise<void>;
  next: Promise<void> | null;
};
