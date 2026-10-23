import type { AdminCsvFile } from '@gnomevpn/schemas';

export type UseCsvExportInput<Query> = {
  request: (query: Query) => Promise<AdminCsvFile>;
  onError: (error: unknown) => void;
};
