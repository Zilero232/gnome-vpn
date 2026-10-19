import { isServer } from '@/shared/lib';

import type { DownloadConfInput } from './conf-download.types';

import { CONF_MIME } from './conf-download.constants';

export const downloadConf = ({ filename, conf }: DownloadConfInput): void => {
  if (isServer()) {
    return;
  }

  const url = URL.createObjectURL(new Blob([conf], { type: CONF_MIME }));
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
