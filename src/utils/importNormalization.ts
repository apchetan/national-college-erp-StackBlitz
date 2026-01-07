export interface ImportWarning {
  row: number;
  field: string;
  originalValue: any;
  message: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: ImportWarning[];
}

export function normalizePhone(value: any): string | null {
  if (!value) return null;

  const phoneStr = String(value).trim();
  if (!phoneStr) return null;

  const digitsOnly = phoneStr.replace(/[^\d+]/g, '');

  if (digitsOnly.startsWith('+91')) {
    const number = digitsOnly.substring(3);
    if (number.length === 10) {
      return digitsOnly;
    }
  } else if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  } else if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  return digitsOnly.length >= 10 ? digitsOnly : null;
}

export function normalizeEmail(value: any): string | null {
  if (!value) return null;

  const emailStr = String(value).trim().toLowerCase();
  if (!emailStr) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr) ? emailStr : null;
}

export function normalizeDate(value: any): string | null {
  if (!value) return null;

  const dateStr = String(value).trim();
  if (!dateStr) return null;

  const ddmmyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const yyyymmddRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;

  let match = dateStr.match(ddmmyyyyRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    }
  }

  match = dateStr.match(yyyymmddRegex);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    }
  }

  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toISOString().split('T')[0];
  }

  return null;
}

export function normalizeTotalExperience(value: any): number | null {
  if (value === null || value === undefined) return null;

  const strValue = String(value).trim().toLowerCase();
  if (!strValue) return null;

  const numberMatch = strValue.match(/(\d+\.?\d*)/);
  if (numberMatch) {
    const num = parseFloat(numberMatch[1]);
    return !isNaN(num) ? num : null;
  }

  return null;
}

export function normalizeSalary(value: any): number | null {
  if (value === null || value === undefined) return null;

  const strValue = String(value).trim().toLowerCase();
  if (!strValue) return null;

  const cleanedValue = strValue.replace(/[,\s]/g, '');
  const numberMatch = cleanedValue.match(/(\d+\.?\d*)/);

  if (numberMatch) {
    const num = parseFloat(numberMatch[1]);
    return !isNaN(num) && num > 0 ? num : null;
  }

  return null;
}

export function normalizeString(value: any): string | null {
  if (value === null || value === undefined) return null;

  const strValue = String(value).trim();
  return strValue === '' || strValue === 'null' || strValue === 'undefined' ? null : strValue;
}

export function validateMandatoryFields(row: any, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!row.first_name || String(row.first_name).trim() === '') {
    errors.push(`Row ${rowIndex + 1}: First Name is required`);
  }

  const normalizedPhone = normalizePhone(row.phone);
  if (!normalizedPhone) {
    errors.push(`Row ${rowIndex + 1}: Valid Phone is required`);
  }

  const normalizedEmail = normalizeEmail(row.email);
  if (!normalizedEmail) {
    errors.push(`Row ${rowIndex + 1}: Valid Email is required`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function cleanEmptyValue(value: any): any {
  if (value === '' || value === null || value === undefined || value === 'null' || value === 'undefined') {
    return null;
  }
  return value;
}

export function normalizeImportRow(row: any, rowIndex: number): { normalized: any; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const normalized: any = {};

  normalized.first_name = normalizeString(row.first_name);
  normalized.last_name = normalizeString(row.last_name);

  const normalizedPhone = normalizePhone(row.phone);
  if (row.phone && !normalizedPhone) {
    warnings.push({
      row: rowIndex + 1,
      field: 'phone',
      originalValue: row.phone,
      message: 'Invalid phone format, set to NULL'
    });
  }
  normalized.phone = normalizedPhone;

  const normalizedMobile1 = normalizePhone(row.mobile1);
  if (row.mobile1 && !normalizedMobile1) {
    warnings.push({
      row: rowIndex + 1,
      field: 'mobile1',
      originalValue: row.mobile1,
      message: 'Invalid mobile1 format, set to NULL'
    });
  }
  normalized.mobile1 = normalizedMobile1;

  const normalizedMobile2 = normalizePhone(row.mobile2);
  if (row.mobile2 && !normalizedMobile2) {
    warnings.push({
      row: rowIndex + 1,
      field: 'mobile2',
      originalValue: row.mobile2,
      message: 'Invalid mobile2 format, set to NULL'
    });
  }
  normalized.mobile2 = normalizedMobile2;

  const normalizedEmail = normalizeEmail(row.email);
  if (row.email && !normalizedEmail) {
    warnings.push({
      row: rowIndex + 1,
      field: 'email',
      originalValue: row.email,
      message: 'Invalid email format, set to NULL'
    });
  }
  normalized.email = normalizedEmail;

  const normalizedDOB = normalizeDate(row.date_of_birth);
  if (row.date_of_birth && !normalizedDOB) {
    warnings.push({
      row: rowIndex + 1,
      field: 'date_of_birth',
      originalValue: row.date_of_birth,
      message: 'Invalid date format, set to NULL'
    });
  }
  normalized.date_of_birth = normalizedDOB;

  const normalizedAppDate = normalizeDate(row.date_of_application);
  if (row.date_of_application && !normalizedAppDate) {
    warnings.push({
      row: rowIndex + 1,
      field: 'date_of_application',
      originalValue: row.date_of_application,
      message: 'Invalid date format, set to NULL'
    });
  }
  normalized.date_of_application = normalizedAppDate;

  const normalizedExp = normalizeTotalExperience(row.total_experience);
  if (row.total_experience && normalizedExp === null) {
    warnings.push({
      row: rowIndex + 1,
      field: 'total_experience',
      originalValue: row.total_experience,
      message: 'Invalid experience format, set to NULL'
    });
  }
  normalized.total_experience = normalizedExp;

  const normalizedSalary = normalizeSalary(row.salary);
  if (row.salary && normalizedSalary === null) {
    warnings.push({
      row: rowIndex + 1,
      field: 'salary',
      originalValue: row.salary,
      message: 'Invalid salary format, set to NULL'
    });
  }
  normalized.salary = normalizedSalary;

  normalized.city = normalizeString(row.city);
  normalized.address = normalizeString(row.address);
  normalized.gender = normalizeString(row.gender);
  normalized.company = normalizeString(row.company);
  normalized.caller = normalizeString(row.caller);
  normalized.source = normalizeString(row.source);
  normalized.program = normalizeString(row.program);
  normalized.role = normalizeString(row.role);
  normalized.industry = normalizeString(row.industry);
  normalized.ug_degree = normalizeString(row.ug_degree);
  normalized.ug_specialization = normalizeString(row.ug_specialization);
  normalized.ug_university = normalizeString(row.ug_university);
  normalized.pg_degree = normalizeString(row.pg_degree);
  normalized.pg_specialization = normalizeString(row.pg_specialization);
  normalized.pg_university = normalizeString(row.pg_university);
  normalized.remark = normalizeString(row.remark);

  if (!normalized.status) {
    normalized.status = 'new';
  }

  Object.keys(normalized).forEach(key => {
    normalized[key] = cleanEmptyValue(normalized[key]);
  });

  return { normalized, warnings };
}

export function getMandatoryFields(): string[] {
  return ['first_name', 'phone', 'email'];
}

export function isFieldMandatory(fieldName: string): boolean {
  return getMandatoryFields().includes(fieldName);
}
