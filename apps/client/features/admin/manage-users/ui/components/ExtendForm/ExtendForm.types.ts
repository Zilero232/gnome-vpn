export type ExtendFormProps = {
  userId: string;
  currentPeriodEnd: string | null;
};

export type PendingExtension = {
  days: number;
  end: Date;
};
