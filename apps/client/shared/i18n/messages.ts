import type { Locale } from './locale';

import enAbout from './locales/en/about.json';
import enAccount from './locales/en/account.json';
import enAdmin from './locales/en/admin.json';
import enAuth from './locales/en/auth.json';
import enBlog from './locales/en/blog.json';
import enCommon from './locales/en/common.json';
import enDevices from './locales/en/devices.json';
import enError from './locales/en/error.json';
import enErrors from './locales/en/errors.json';
import enFaq from './locales/en/faq.json';
import enFooter from './locales/en/footer.json';
import enGifts from './locales/en/gifts.json';
import enIncy from './locales/en/incy.json';
import enLanding from './locales/en/landing.json';
import enNav from './locales/en/nav.json';
import enNotFound from './locales/en/notFound.json';
import enPayments from './locales/en/payments.json';
import enPlans from './locales/en/plans.json';
import enPricing from './locales/en/pricing.json';
import enPrivacy from './locales/en/privacy.json';
import enReferrals from './locales/en/referrals.json';
import enRouting from './locales/en/routing.json';
import enServers from './locales/en/servers.json';
import enSetup from './locales/en/setup.json';
import enStatus from './locales/en/status.json';
import enTelegram from './locales/en/telegram.json';
import enTerms from './locales/en/terms.json';
import enTrial from './locales/en/trial.json';
import enValidation from './locales/en/validation.json';
import enWireguard from './locales/en/wireguard.json';
import ruAbout from './locales/ru/about.json';
import ruAccount from './locales/ru/account.json';
import ruAdmin from './locales/ru/admin.json';
import ruAuth from './locales/ru/auth.json';
import ruBlog from './locales/ru/blog.json';
import ruCommon from './locales/ru/common.json';
import ruDevices from './locales/ru/devices.json';
import ruError from './locales/ru/error.json';
import ruErrors from './locales/ru/errors.json';
import ruFaq from './locales/ru/faq.json';
import ruFooter from './locales/ru/footer.json';
import ruGifts from './locales/ru/gifts.json';
import ruIncy from './locales/ru/incy.json';
import ruLanding from './locales/ru/landing.json';
import ruNav from './locales/ru/nav.json';
import ruNotFound from './locales/ru/notFound.json';
import ruPayments from './locales/ru/payments.json';
import ruPlans from './locales/ru/plans.json';
import ruPricing from './locales/ru/pricing.json';
import ruPrivacy from './locales/ru/privacy.json';
import ruReferrals from './locales/ru/referrals.json';
import ruRouting from './locales/ru/routing.json';
import ruServers from './locales/ru/servers.json';
import ruSetup from './locales/ru/setup.json';
import ruStatus from './locales/ru/status.json';
import ruTelegram from './locales/ru/telegram.json';
import ruTerms from './locales/ru/terms.json';
import ruTrial from './locales/ru/trial.json';
import ruValidation from './locales/ru/validation.json';
import ruWireguard from './locales/ru/wireguard.json';

const ru = {
  about: ruAbout,
  admin: ruAdmin,
  account: ruAccount,
  auth: ruAuth,
  blog: ruBlog,
  common: ruCommon,
  devices: ruDevices,
  error: ruError,
  errors: ruErrors,
  faq: ruFaq,
  footer: ruFooter,
  gifts: ruGifts,
  incy: ruIncy,
  landing: ruLanding,
  nav: ruNav,
  notFound: ruNotFound,
  payments: ruPayments,
  plans: ruPlans,
  pricing: ruPricing,
  privacy: ruPrivacy,
  referrals: ruReferrals,
  routing: ruRouting,
  servers: ruServers,
  setup: ruSetup,
  status: ruStatus,
  telegram: ruTelegram,
  terms: ruTerms,
  trial: ruTrial,
  validation: ruValidation,
  wireguard: ruWireguard
};

const en = {
  about: enAbout,
  admin: enAdmin,
  account: enAccount,
  auth: enAuth,
  blog: enBlog,
  common: enCommon,
  devices: enDevices,
  error: enError,
  errors: enErrors,
  faq: enFaq,
  footer: enFooter,
  gifts: enGifts,
  incy: enIncy,
  landing: enLanding,
  nav: enNav,
  notFound: enNotFound,
  payments: enPayments,
  plans: enPlans,
  pricing: enPricing,
  privacy: enPrivacy,
  referrals: enReferrals,
  routing: enRouting,
  servers: enServers,
  setup: enSetup,
  status: enStatus,
  telegram: enTelegram,
  terms: enTerms,
  trial: enTrial,
  validation: enValidation,
  wireguard: enWireguard
};

export type Messages = typeof ru;

export const messages: Record<Locale, Messages> = { ru, en };
