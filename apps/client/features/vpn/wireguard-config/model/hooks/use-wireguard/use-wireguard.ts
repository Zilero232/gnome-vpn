'use client';

import { useQuery } from '@tanstack/react-query';

import { getWireguard } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useWireguard = () => useQuery({ queryKey: QUERY_KEYS.wireguard(), queryFn: getWireguard });
