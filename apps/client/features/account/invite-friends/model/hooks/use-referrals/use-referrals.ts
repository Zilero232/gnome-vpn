'use client';

import { useQuery } from '@tanstack/react-query';

import { getReferrals } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useReferrals = () => useQuery({ queryKey: QUERY_KEYS.referrals(), queryFn: getReferrals });
