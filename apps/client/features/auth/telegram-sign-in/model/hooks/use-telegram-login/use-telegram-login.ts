'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { isNullish } from 'remeda';

import { useRouter } from '@/shared/i18n/navigation';
import { postAuthHref } from '@/shared/lib';

import type { TelegramLoginState, TelegramWidgetUser } from './use-telegram-login.types';

import { useTelegramWidget } from '../use-telegram-widget';
import { useWidgetSignIn } from '../use-widget-sign-in';
import { TELEGRAM_LOGIN } from './use-telegram-login.constants';
import { payloadOf, widgetScript } from './use-telegram-login.helpers';

export const useTelegramLogin = (): TelegramLoginState => {
  const router = useRouter();
  const { data: widget } = useTelegramWidget();
  const signIn = useWidgetSignIn();
  const slotRef = useRef<HTMLDivElement>(null);
  const [isUnreachable, setIsUnreachable] = useState(false);

  const onAuth = useEffectEvent((user: TelegramWidgetUser) => {
    signIn.mutate(payloadOf(user), { onSuccess: () => router.replace(postAuthHref(window.location.search)) });
  });

  const botUsername = widget?.botUsername;

  useEffect(() => {
    const slot = slotRef.current;

    if (isNullish(slot) || !botUsername) {
      return;
    }

    window[TELEGRAM_LOGIN.callbackName] = (user) => onAuth(user);

    slot.append(widgetScript({ botUsername, onError: () => setIsUnreachable(true) }));

    return () => {
      slot.replaceChildren();
      delete window[TELEGRAM_LOGIN.callbackName];
    };
  }, [botUsername]);

  return { slotRef, isUnreachable, isPending: signIn.isPending, isError: signIn.isError };
};
