import { Monitor, Router, ShieldCheck, Smartphone } from 'lucide-react';

export const WIREGUARD_TARGETS = [
  { id: 'amnezia', icon: Smartphone },
  { id: 'wireguard', icon: ShieldCheck },
  { id: 'wiresock', icon: Monitor },
  { id: 'router', icon: Router }
] as const;
