import { Injectable, Logger } from '@nestjs/common';

import { AppServiceUnavailableException } from '@/common/exceptions';
import { AppConfigService } from '@/config';

import type {
  BindPaymentMethodInput,
  ChargeRecurringInput,
  CreatePaymentInput,
  CreatePaymentResult,
  CreateRefundInput,
  PaymentInfo,
  PaymentMethodInfo,
  PaymentMethodResponse,
  RefundInfo,
  RefundResponse,
  ShopSettings,
  YooKassaRequestInput,
  YooKassaSendInput
} from './yookassa.types';

import { YOOKASSA_API } from './yookassa.constants';
import { describeCard, toAmount } from './yookassa.helpers';
import { paymentMethodResponseSchema, paymentResponseSchema, refundResponseSchema, shopSettingsResponseSchema } from './yookassa.schemas';

@Injectable()
export class YooKassaClient {
  private readonly logger = new Logger(YooKassaClient.name);

  constructor(private readonly config: AppConfigService) {}

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const payload = await this.request({
      path: '/payments',
      init: {
        method: 'POST',
        body: JSON.stringify({
          capture: true,
          amount: toAmount(input.amountRub),
          description: input.description,
          save_payment_method: input.savePaymentMethod,
          confirmation: { type: 'redirect', return_url: input.returnUrl }
        })
      },
      idempotenceKey: input.idempotenceKey,
      schema: paymentResponseSchema
    });

    return { id: payload.id, status: payload.status, confirmationUrl: payload.confirmation?.confirmation_url ?? null };
  }

  async chargeRecurring(input: ChargeRecurringInput): Promise<CreatePaymentResult> {
    const payload = await this.request({
      path: '/payments',
      init: {
        method: 'POST',
        body: JSON.stringify({
          amount: toAmount(input.amountRub),
          description: input.description,
          capture: true,
          payment_method_id: input.paymentMethodId
        })
      },
      idempotenceKey: input.idempotenceKey,
      schema: paymentResponseSchema
    });

    return { id: payload.id, status: payload.status, confirmationUrl: null };
  }

  async getPayment(paymentId: string): Promise<PaymentInfo> {
    const payload = await this.request({
      path: `/payments/${encodeURIComponent(paymentId)}`,
      init: { method: 'GET' },
      schema: paymentResponseSchema
    });

    const method = payload.payment_method;

    return {
      id: payload.id,
      status: payload.status,
      paymentMethodId: method?.saved === true ? (method.id ?? null) : null,
      paymentMethodTitle: describeCard({ card: method?.card, title: method?.title }),
      cancellationReason: payload.cancellation_details?.reason ?? null,
      confirmationUrl: payload.confirmation?.confirmation_url ?? null,
      returnUrl: payload.confirmation?.return_url ?? null,
      refundedRub: Number(payload.refunded_amount?.value ?? 0)
    };
  }

  async createRefund(input: CreateRefundInput): Promise<RefundInfo> {
    const payload = await this.request({
      path: '/refunds',
      init: {
        method: 'POST',
        body: JSON.stringify({
          payment_id: input.paymentId,
          amount: toAmount(input.amountRub),
          description: input.description
        })
      },
      idempotenceKey: input.idempotenceKey,
      schema: refundResponseSchema
    });

    return this.toRefundInfo(payload);
  }

  async getRefund(refundId: string): Promise<RefundInfo> {
    const payload = await this.request({ path: `/refunds/${encodeURIComponent(refundId)}`, init: { method: 'GET' }, schema: refundResponseSchema });

    return this.toRefundInfo(payload);
  }

  async bindPaymentMethod(input: BindPaymentMethodInput): Promise<PaymentMethodInfo> {
    const payload = await this.request({
      path: '/payment_methods',
      init: {
        method: 'POST',
        body: JSON.stringify({
          type: 'bank_card',
          confirmation: { type: 'redirect', return_url: input.returnUrl }
        })
      },
      idempotenceKey: input.idempotenceKey,
      schema: paymentMethodResponseSchema
    });

    return this.toPaymentMethodInfo(payload);
  }

  async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethodInfo> {
    const payload = await this.request({
      path: `/payment_methods/${encodeURIComponent(paymentMethodId)}`,
      init: { method: 'GET' },
      schema: paymentMethodResponseSchema
    });

    return this.toPaymentMethodInfo(payload);
  }

  async shopSettings(): Promise<ShopSettings> {
    const payload = await this.request({ path: '/me', init: { method: 'GET' }, schema: shopSettingsResponseSchema });

    return { paymentMethods: payload.payment_methods ?? [] };
  }

  async isPaymentMethodUsable(paymentMethodId: string): Promise<boolean | null> {
    const res = await this.send({ path: `/payment_methods/${encodeURIComponent(paymentMethodId)}`, init: { method: 'GET' } });

    if (res.status === 400 || res.status === 404) {
      return false;
    }

    if (!res.ok) {
      return null;
    }

    const payload = paymentMethodResponseSchema.parse(await res.json());

    return payload.saved === true && payload.status === 'active';
  }

  private async request<T>({ schema, ...input }: YooKassaRequestInput<T>): Promise<T> {
    const res = await this.send(input);

    if (!res.ok) {
      this.logger.error(`yookassa ${input.path} returned ${res.status}: ${await res.text()}`);

      throw new AppServiceUnavailableException('PAYMENT_FAILED', `yookassa ${input.path} returned ${res.status}`);
    }

    return schema.parse(await res.json());
  }

  private send({ path, init, idempotenceKey }: YooKassaSendInput): Promise<Response> {
    return fetch(`${YOOKASSA_API.url}${path}`, {
      ...init,
      headers: this.headers(idempotenceKey),
      signal: AbortSignal.timeout(YOOKASSA_API.timeoutMs)
    });
  }

  private headers(idempotenceKey?: string): Record<string, string> {
    const credentials = btoa(`${this.config.get('yookassa').shopId}:${this.config.get('yookassa').secretKey}`);

    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
      ...(idempotenceKey ? { 'Idempotence-Key': idempotenceKey } : {})
    };
  }

  private toRefundInfo(payload: RefundResponse): RefundInfo {
    return { id: payload.id, paymentId: payload.payment_id, status: payload.status, amountRub: Number(payload.amount.value) };
  }

  private toPaymentMethodInfo(payload: PaymentMethodResponse): PaymentMethodInfo {
    return {
      id: payload.id,
      status: payload.status,
      title: describeCard({ card: payload.card, title: payload.title }),
      confirmationUrl: payload.confirmation?.confirmation_url ?? null
    };
  }
}
