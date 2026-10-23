'use client';

import { useQuery } from '@tanstack/react-query';

import { getAdminUser } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminUser = (id: string) => useQuery({ queryKey: QUERY_KEYS.adminUser(id), queryFn: () => getAdminUser(id) });
