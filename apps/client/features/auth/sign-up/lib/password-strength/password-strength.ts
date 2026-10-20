export type PasswordStrength = 'fair' | 'strong' | 'weak';

const CLASSES = [/\p{Ll}/u, /\p{Lu}/u, /\d/u, /[^\p{L}\d]/u];

export const passwordStrength = (password: string): PasswordStrength => {
  const variety = CLASSES.filter((pattern) => pattern.test(password)).length;

  if (password.length < 8) {
    return 'weak';
  }

  if (password.length >= 12 && variety >= 3) {
    return 'strong';
  }

  return variety >= 2 || password.length >= 14 ? 'fair' : 'weak';
};
