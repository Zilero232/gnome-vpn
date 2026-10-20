import { useEffect, useState } from 'react';
import { isNonNullish } from 'remeda';

export const useCodeExpiry = (expiresAt: string | undefined): boolean => {
  const [expired, setExpired] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const timer = window.setTimeout(setExpired, Math.max(0, Date.parse(expiresAt) - Date.now()), expiresAt);

    return () => window.clearTimeout(timer);
  }, [expiresAt]);

  return isNonNullish(expiresAt) && expired === expiresAt;
};
