'use client';

import { useMount } from '@siberiacancode/reactuse';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { match } from 'ts-pattern';

import { ForgotPasswordForm } from '@/features/auth/forgot-password';
import { SignInForm } from '@/features/auth/sign-in';
import { SignUpForm } from '@/features/auth/sign-up';
import { TelegramLoginButton } from '@/features/auth/telegram-sign-in';
import { AUTH_MODE, QUERY_PARAMS } from '@/shared/constants';
import { Segmented, Text } from '@/ui-kit';
import { AuthShell } from '@/widgets/auth/auth-shell';

import type { AuthMode } from './AuthPage.types';

import { FORM_SWAP } from './AuthPage.motion';
import { AuthReasons } from './components';

import s from './AuthPage.module.scss';

export const AuthPage = () => {
  const t = useTranslations('auth');

  const [mode, setMode] = useState<AuthMode>(AUTH_MODE.signin);
  const [isEntering, setIsEntering] = useState(false);

  useMount(() => {
    if (new URLSearchParams(window.location.search).get(QUERY_PARAMS.mode) === AUTH_MODE.signup) {
      setMode(AUTH_MODE.signup);
    }
  });

  const changeMode = (next: AuthMode) => {
    const url = new URL(window.location.href);

    url.searchParams.set(QUERY_PARAMS.mode, next);
    window.history.replaceState(window.history.state, '', url);
    setMode(next);
  };

  const onSuccess = () => setIsEntering(true);

  return (
    <AuthShell aside={<AuthReasons mode={mode} />} isEntering={isEntering} pose={mode === AUTH_MODE.forgot ? 'key' : 'welcome'}>
      <Text as='h1' className={mode === AUTH_MODE.forgot ? s.title : s.hiddenTitle}>
        {match(mode)
          .with('signup', () => t('signUp'))
          .with('signin', () => t('signIn'))
          .with('forgot', () => t('forgotPassword'))
          .exhaustive()}
      </Text>

      {mode !== AUTH_MODE.forgot && (
        <Segmented
          options={[
            { value: AUTH_MODE.signin, label: t('signIn') },
            { value: AUTH_MODE.signup, label: t('signUp') }
          ]}
          aria-label={t('modeLabel')}
          value={mode}
          onChange={changeMode}
        />
      )}

      {mode !== AUTH_MODE.forgot && <TelegramLoginButton />}

      <motion.div layout className={s.forms} transition={{ duration: 0.25 }}>
        <AnimatePresence initial={false} mode='wait'>
          <motion.div key={mode} animate='visible' exit='exit' initial='hidden' variants={FORM_SWAP}>
            {match(mode)
              .with('signup', () => <SignUpForm onSuccess={onSuccess} />)
              .with('signin', () => <SignInForm onForgotPassword={() => changeMode(AUTH_MODE.forgot)} onSuccess={onSuccess} />)
              .with('forgot', () => <ForgotPasswordForm onBack={() => changeMode(AUTH_MODE.signin)} />)
              .exhaustive()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AuthShell>
  );
};
