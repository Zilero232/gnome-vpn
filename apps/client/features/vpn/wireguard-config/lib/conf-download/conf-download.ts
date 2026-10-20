import type { DownloadConfInput } from './conf-download.types';

import { CONF_DOWNLOAD } from './conf-download.constants';

export const downloadConf = ({ filename, conf }: DownloadConfInput): void => {
  const url = URL.createObjectURL(new Blob([conf], { type: CONF_DOWNLOAD.mime }));
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.hidden = true;

  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(URL.revokeObjectURL, CONF_DOWNLOAD.revokeDelayMs, url);
};
