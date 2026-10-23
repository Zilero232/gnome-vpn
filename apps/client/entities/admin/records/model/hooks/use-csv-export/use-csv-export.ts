'use client';

import { ADMIN_EXPORT } from '@gnomevpn/schemas';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { downloadFile } from '@/shared/lib';

import type { UseCsvExportInput } from './use-csv-export.types';

import { CSV_FILE } from './use-csv-export.constants';

export const useCsvExport = <Query>({ request, onError }: UseCsvExportInput<Query>) => {
  const t = useTranslations('admin.export');

  return useMutation({
    mutationFn: request,
    onError,
    onSuccess: (file) => {
      downloadFile({ filename: file.filename, content: file.content, type: CSV_FILE.type });
      toast.success(file.isTruncated ? t('truncated', { rows: file.rows, max: ADMIN_EXPORT.maxRows }) : t('done', { rows: file.rows }));
    }
  });
};
