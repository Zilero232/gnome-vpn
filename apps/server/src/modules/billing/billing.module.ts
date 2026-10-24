import { Module } from '@nestjs/common';

import { YooKassaClient } from '@/lib/yookassa';

import { PromoCodesModule } from '../promo-codes';
import { ReferralsModule } from '../referrals';
import { SubscriptionModule } from '../subscription';
import { SubscriptionLinkModule } from '../subscription-link';
import { TelegramNotifyModule } from '@/modules/telegram/notify';
import { AutoRenewController } from './auto-renew/auto-renew.controller';
import { AutoRenewService } from './auto-renew/auto-renew.service';
import { CheckoutController } from './checkout/checkout.controller';
import { CheckoutService } from './checkout/checkout.service';
import { PaymentMethodsService } from './checkout/payment-methods.service';
import { CardService } from './shared/card.service';
import { PaymentNoticeService } from './shared/payment-notice.service';
import { PendingPaymentService } from './shared/pending-payment.service';
import { RefundService } from './shared/refund.service';
import { SettlementService } from './shared/settlement.service';
import { SubscriptionGrantService } from './shared/subscription-grant.service';
import { WebhookIpGuard } from './webhook/webhook-ip.guard';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';

@Module({
  imports: [ReferralsModule, SubscriptionModule, SubscriptionLinkModule, TelegramNotifyModule, PromoCodesModule],
  controllers: [CheckoutController, AutoRenewController, WebhookController],
  providers: [
    YooKassaClient,
    CheckoutService,
    PaymentMethodsService,
    AutoRenewService,
    WebhookService,
    WebhookIpGuard,
    SettlementService,
    SubscriptionGrantService,
    RefundService,
    CardService,
    PaymentNoticeService,
    PendingPaymentService
  ],
  exports: [AutoRenewService, CheckoutService, SettlementService, YooKassaClient]
})
export class BillingModule {}
