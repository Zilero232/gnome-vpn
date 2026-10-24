import { Module } from '@nestjs/common';

import { AppConfigService } from '@/config';
import { makeYooKassaClient, YooKassaClient } from '@/lib/yookassa';

import { PromoCodesModule } from '../promo-codes';
import { ReferralsModule } from '../referrals';
import { SubscriptionLinkModule } from '../subscription-link';
import { TelegramNotifyModule } from '../telegram/telegram-notify.module';
import { BillingController } from './billing.controller';
import { WebhookIpGuard } from './guards';
import { AutoRenewService, BillingSharedService, CardService, CheckoutService, PaymentMethodsService, WebhookService } from './services';

const yooKassaProvider = {
  provide: YooKassaClient,
  useFactory: (config: AppConfigService) => makeYooKassaClient(config),
  inject: [AppConfigService]
};

@Module({
  imports: [ReferralsModule, SubscriptionLinkModule, TelegramNotifyModule, PromoCodesModule],
  controllers: [BillingController],
  providers: [
    BillingSharedService,
    CheckoutService,
    WebhookService,
    AutoRenewService,
    CardService,
    PaymentMethodsService,
    WebhookIpGuard,
    yooKassaProvider
  ],
  exports: [AutoRenewService, CardService, CheckoutService, WebhookService, YooKassaClient]
})
export class BillingModule {}
