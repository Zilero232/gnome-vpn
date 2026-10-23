import type { AdminCsvFile } from '@gnomevpn/schemas';

import { CSV_DOWNLOAD } from './csv-download.constants';

export const downloadCsv = ({ filename, content }: AdminCsvFile): void => {
  const url = URL.createObjectURL(new Blob([content], { type: CSV_DOWNLOAD.mime }));
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.hidden = true;

  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(URL.revokeObjectURL, CSV_DOWNLOAD.revokeDelayMs, url);
};
