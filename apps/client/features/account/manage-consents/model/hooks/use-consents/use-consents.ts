'use client';

import { useQuery } from '@tanstack/react-query';

import { getConsents } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useConsents = () => useQuery({ queryKey: QUERY_KEYS.consents(), queryFn: getConsents });
