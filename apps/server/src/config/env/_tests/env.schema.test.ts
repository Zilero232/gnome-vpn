import { describe, expect, it } from 'vitest';

import { validateEnv } from '../env.schema';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/gnome',
  DIRECT_URL: 'postgresql://user:pass@localhost:5432/gnome',
  API_URL: 'http://localhost:4000',
  BETTER_AUTH_SECRET: 'a-secret'
};

describe('validateEnv', () => {
  it('parses an env carrying every required variable into its groups', () => {
    expect(validateEnv(validEnv)).toMatchObject({
      database: { url: validEnv.DATABASE_URL, directUrl: validEnv.DIRECT_URL },
      app: { apiUrl: validEnv.API_URL },
      auth: { secret: validEnv.BETTER_AUTH_SECRET }
    });
  });

  it('applies the defaults for everything optional', () => {
    const parsed = validateEnv(validEnv);

    expect(parsed).toMatchObject({
      app: {
        nodeEnv: 'development',
        isDevelopment: true,
        isProduction: false,
        port: 4000,
        corsOrigins: 'http://localhost:3000',
        clientUrl: 'http://localhost:3000'
      },
      yookassa: { returnUrl: 'http://localhost:3000/account' },
      email: { smtp: { port: 465 } }
    });
  });

  it('throws when a required variable is missing', () => {
    const { DATABASE_URL, ...withoutDatabase } = validEnv;

    expect(() => validateEnv(withoutDatabase)).toThrow('Invalid environment:');
  });

  it('names the missing variable in the thrown message', () => {
    const { BETTER_AUTH_SECRET, ...withoutSecret } = validEnv;

    expect(() => validateEnv(withoutSecret)).toThrow(/BETTER_AUTH_SECRET/);
  });

  it('throws when a url variable is not a url', () => {
    expect(() => validateEnv({ ...validEnv, API_URL: 'not-a-url' })).toThrow('Invalid environment:');
  });

  it('throws when the auth secret is empty', () => {
    expect(() => validateEnv({ ...validEnv, BETTER_AUTH_SECRET: '' })).toThrow('Invalid environment:');
  });

  it('turns the string true into a real boolean', () => {
    expect(validateEnv({ ...validEnv, YOOKASSA_RECURRING: 'true' }).yookassa.isRecurringEnabled).toBe(true);
  });

  it('turns the string false into a real boolean', () => {
    expect(validateEnv({ ...validEnv, SMTP_SECURE: 'false' }).email.smtp.secure).toBe(false);
  });

  it('defaults the recurring flag to false and the smtp secure flag to true', () => {
    const parsed = validateEnv(validEnv);

    expect([parsed.yookassa.isRecurringEnabled, parsed.email.smtp.secure]).toEqual([false, true]);
  });

  it('rejects a boolean variable that is neither true nor false', () => {
    expect(() => validateEnv({ ...validEnv, YOOKASSA_RECURRING: 'yes' })).toThrow('Invalid environment:');
  });

  it('coerces a numeric port from its string form', () => {
    expect(validateEnv({ ...validEnv, PORT: '8080' }).app.port).toBe(8080);
  });

  it('rejects an unknown node environment', () => {
    expect(() => validateEnv({ ...validEnv, NODE_ENV: 'staging' })).toThrow('Invalid environment:');
  });

  it('rejects a malformed dev email override', () => {
    expect(() => validateEnv({ ...validEnv, DEV_EMAIL_OVERRIDE: 'nope' })).toThrow('Invalid environment:');
  });

  it('has no admins unless the list names some', () => {
    expect(validateEnv(validEnv).auth.adminEmails).toEqual([]);
  });

  it('reads the admin list case-insensitively, once per address, skipping empty entries', () => {
    const admins = ['owner@example.com', 'support@example.com'] as const;
    const raw = ` ${admins[0].toUpperCase()} ,, ${admins[1]}, ${admins[0]} `;

    expect(validateEnv({ ...validEnv, ADMIN_EMAILS: raw }).auth.adminEmails).toEqual(admins);
  });

  it('refuses to boot with an admin entry that is not an email', () => {
    expect(() => validateEnv({ ...validEnv, ADMIN_EMAILS: 'owner@example.com, owner' })).toThrow(/ADMIN_EMAILS/);
  });
});
