'use client';

import { useQuery } from '@tanstack/react-query';

import { getRoutingSettings } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useRoutingSettings = () => useQuery({ queryKey: QUERY_KEYS.routingSettings(), queryFn: getRoutingSettings });
