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

export function validateMinLength(value: string, minLength: number): boolean {
  if (!value) return false;
  return value.trim().length >= minLength;
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  if (!value) return true;
  return value.trim().length <= maxLength;
}

export function validateNumericRange(value: number | string | null | undefined, min: number, max: number): boolean {
  if (value === null || value === undefined || value === '') return false;

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return false;

  return num >= min && num <= max;
}

export function validatePositiveNumber(value: number | string | null | undefined): boolean {
  if (value === null || value === undefined || value === '') return false;

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return false;

  return num > 0;
}
