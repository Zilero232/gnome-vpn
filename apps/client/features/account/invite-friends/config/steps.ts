import { CreditCard, Gift, Send } from 'lucide-react';

export const INVITE_STEPS = [
  { key: 'send', icon: Send },
  { key: 'pay', icon: CreditCard },
  { key: 'earn', icon: Gift }
] as const;
