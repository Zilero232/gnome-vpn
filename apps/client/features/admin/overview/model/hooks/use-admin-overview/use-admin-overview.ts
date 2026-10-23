'use client';

import { useQuery } from '@tanstack/react-query';

import { getAdminOverview } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminOverview = () => useQuery({ queryKey: QUERY_KEYS.adminOverview(), queryFn: getAdminOverview });
