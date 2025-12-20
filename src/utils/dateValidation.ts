export function convertToDBFormat(dateValue: string): string | null {
  if (!dateValue || dateValue.trim() === '') return null;

  const trimmed = dateValue.trim();
  if (trimmed.toUpperCase() === 'NA' || trimmed.toUpperCase() === 'N/A') {
    return null;
  }

  const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

  const ddmmyyyyMatch = trimmed.match(ddmmyyyyPattern);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month}-${day}`;
  }

  const yyyymmddMatch = trimmed.match(yyyymmddPattern);
  if (yyyymmddMatch) {
    return trimmed;
  }

  return null;
}

export function sanitizeDateValue(value: any): string | null {
  if (!value || value === 'NA' || value === 'null' || value === 'undefined') {
    return null;
  }

  const stringValue = String(value).trim();

  if (stringValue === '' || stringValue.toUpperCase() === 'NA' || stringValue.toUpperCase() === 'N/A') {
    return null;
  }

  const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

  if (ddmmyyyyPattern.test(stringValue)) {
    return convertToDBFormat(stringValue);
  }

  if (yyyymmddPattern.test(stringValue)) {
    return stringValue;
  }

  return null;
}

export function cleanDateForForm(dateValue: string | null | undefined): string {
  if (!dateValue) return '';

  const trimmed = dateValue.trim();
  if (trimmed === 'NA' || trimmed.toUpperCase() === 'N/A' || trimmed === 'null' || trimmed === 'undefined') {
    return '';
  }

  const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (yyyymmddPattern.test(trimmed)) {
    return trimmed;
  }

  const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = trimmed.match(ddmmyyyyPattern);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}
