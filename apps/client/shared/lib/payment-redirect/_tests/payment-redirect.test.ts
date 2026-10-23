import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { redirectToConfirmation } from '../payment-redirect';

const URL_YOOKASSA = 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=42';

let assign: ReturnType<typeof vi.fn>;
let realLocation: Location;

beforeEach(() => {
  assign = vi.fn();
  realLocation = window.location;

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...realLocation, assign }
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
});

describe('redirectToConfirmation', () => {
  it('sends the browser to the confirmation page', () => {
    expect(redirectToConfirmation(URL_YOOKASSA)).toBe(true);
    expect(assign).toHaveBeenCalledWith(URL_YOOKASSA);
  });

  it('reports no redirect when the payment carries no confirmation url', () => {
    expect(redirectToConfirmation(null)).toBe(false);
    expect(assign).not.toHaveBeenCalled();
  });

  it('navigates nothing during prerender, where there is no window to navigate', () => {
    vi.stubGlobal('window', undefined);

    expect(redirectToConfirmation(URL_YOOKASSA)).toBe(false);
    expect(assign).not.toHaveBeenCalled();
  });
});
