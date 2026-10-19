import { Download, KeyRound, Link2 } from 'lucide-react';

export const SETUP_WAYS = [
  { id: 'incy', icon: Download, isRecommended: true },
  { id: 'apps', icon: Link2, isRecommended: false },
  { id: 'wireguard', icon: KeyRound, isRecommended: false }
] as const;
