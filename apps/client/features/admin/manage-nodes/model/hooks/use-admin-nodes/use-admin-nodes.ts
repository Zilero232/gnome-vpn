'use client';

import { useQuery } from '@tanstack/react-query';

import { getAdminNodes } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminNodes = () => useQuery({ queryKey: QUERY_KEYS.adminNodes(), queryFn: getAdminNodes });
