export function displayValue(value: any, fallback: string = '—'): string {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return String(value);
}

export function displayDate(dateValue: any, fallback: string = '—'): string {
  if (!dateValue) return fallback;

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString();
  } catch {
    return fallback;
  }
}

export function displayExperience(years: any, fallback: string = '—'): string {
  if (years === null || years === undefined) return fallback;

  const num = Number(years);
  if (isNaN(num)) return fallback;

  if (num === 0) return '0 years';
  if (num === 1) return '1 year';
  return `${num} years`;
}

export function displayPhone(phone: any, fallback: string = '—'): string {
  if (!phone) return fallback;

  const phoneStr = String(phone);
  if (phoneStr.startsWith('+91')) {
    const number = phoneStr.substring(3);
    return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
  }

  return phoneStr;
}

export function displayArray(arr: any, fallback: string = '—'): string {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return fallback;
  }

  return arr.filter(item => item !== null && item !== undefined && item !== '').join(', ');
}

export function displaySalary(salary: any, fallback: string = '—'): string {
  if (salary === null || salary === undefined) return fallback;

  const num = Number(salary);
  if (isNaN(num)) return fallback;

  return num.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
}
