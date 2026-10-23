import type { DownloadFileInput } from './download-file.types';

import { DOWNLOAD_FILE } from './download-file.constants';

export const downloadFile = ({ filename, content, type = DOWNLOAD_FILE.defaultType }: DownloadFileInput): void => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.hidden = true;

  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(URL.revokeObjectURL, DOWNLOAD_FILE.revokeDelayMs, url);
};
