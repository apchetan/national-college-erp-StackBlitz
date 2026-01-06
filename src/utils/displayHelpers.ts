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
