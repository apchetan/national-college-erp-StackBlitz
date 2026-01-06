export function validateEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateMobile(mobile: string): boolean {
  if (!mobile) return false;

  const cleaned = mobile.replace(/\D/g, '');

  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(cleaned);
}

export function validateRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}
