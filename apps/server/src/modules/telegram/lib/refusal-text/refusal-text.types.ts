import type { ApiErrorCode } from '@gnomevpn/schemas';

export type RefusalCopies = Partial<Record<ApiErrorCode, string>>;

export type RefusalTextInput = {
  error: unknown;
  copies: RefusalCopies;
  fallback: string;
  onUnknown: (error: unknown) => void;
};
