import { Module } from '@nestjs/common';

import { AppConfigService } from '@/config';
import { makeYooKassaClient, YooKassaClient } from '@/lib/yookassa';
import { TelegramNotifyModule } from '@/modules/telegram/notify';

import { PromoCodesModule } from '../promo-codes';
import { ReferralsModule } from '../referrals';
import { SubscriptionModule } from '../subscription';
import { SubscriptionLinkModule } from '../subscription-link';
import { BillingController } from './billing.controller';
import { WebhookIpGuard } from './guards';
import { AutoRenewService, BillingSharedService, CardService, CheckoutService, PaymentMethodsService, WebhookService } from './services';

const yooKassaProvider = {
  provide: YooKassaClient,
  useFactory: (config: AppConfigService) => makeYooKassaClient(config),
  inject: [AppConfigService]
};

@Module({
  imports: [ReferralsModule, SubscriptionModule, SubscriptionLinkModule, TelegramNotifyModule, PromoCodesModule],
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
