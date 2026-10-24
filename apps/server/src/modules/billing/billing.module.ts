import { Module } from '@nestjs/common';

import { YooKassaClient } from '@/lib/yookassa';

import { PromoCodesModule } from '../promo-codes';
import { ReferralsModule } from '../referrals';
import { SubscriptionModule } from '../subscription';
import { SubscriptionLinkModule } from '../subscription-link';
import { TelegramNotifyModule } from '../telegram/telegram-notify.module';
import { BillingController } from './billing.controller';
import { WebhookIpGuard } from './guards';
import { AutoRenewService, BillingSharedService, CardService, CheckoutService, PaymentMethodsService, WebhookService } from './services';

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
    YooKassaClient
  ],
  exports: [AutoRenewService, CardService, CheckoutService, WebhookService, YooKassaClient]
})
export class BillingModule {}
