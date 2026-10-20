import { describe, expect, it } from 'vitest';

import { authErrorField } from '../auth-error-field';

describe('authErrorField', () => {
  it('puts address problems on the email field', () => {
    expect(authErrorField('auth.errors.emailTaken')).toBe('email');
    expect(authErrorField('auth.errors.userNotFound')).toBe('email');
  });

  it('puts credential problems on the password field', () => {
    expect(authErrorField('auth.errors.invalidCredentials')).toBe('password');
  });

  it('leaves everything else to a toast', () => {
    expect(authErrorField('auth.errors.tooManyRequests')).toBeNull();
    expect(authErrorField('errors.UNKNOWN')).toBeNull();
  });
});
