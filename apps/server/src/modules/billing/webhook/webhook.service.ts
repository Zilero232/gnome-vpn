import type { WebhookEvent } from '@gnomevpn/schemas';

import { Injectable, Logger } from '@nestjs/common';
import { match, P } from 'ts-pattern';

import { CardService } from '../shared/card.service';
import { RefundService } from '../shared/refund.service';
import { SettlementService } from '../shared/settlement.service';
import { WEBHOOK_EVENT } from './webhook.constants';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly settlement: SettlementService,
    private readonly refunds: RefundService,
    private readonly card: CardService
  ) {}

  async handleWebhook({ event, object }: WebhookEvent): Promise<void> {
    await match(event)
      .with(WEBHOOK_EVENT.methodActive, () => this.card.confirmPending(object.id))
      .with(WEBHOOK_EVENT.refundSucceeded, () => this.refunds.handleRefund(object.id))
      .with(P.string.startsWith(WEBHOOK_EVENT.paymentPrefix), () => this.settlement.settlePayment(object.id))
      .otherwise(() => this.logger.debug(`ignoring webhook event ${event}`));
  }
}
