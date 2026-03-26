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
