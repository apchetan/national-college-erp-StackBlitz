import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  mobile?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  minAge?: number;
  maxAge?: number;
  futureDate?: boolean;
  pastDate?: boolean;
  maxDaysAhead?: number;
  custom?: (value: any) => string | null;
}

export type ValidationRules = Record<string, ValidationRule>;

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((fieldName: string, value: any, rules: ValidationRule): string | null => {
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'This field is required';
    }

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        const commonTypos = [
          { wrong: 'gmail.con', correct: 'gmail.com' },
          { wrong: 'gmial.com', correct: 'gmail.com' },
          { wrong: 'yahoo.con', correct: 'yahoo.com' },
          { wrong: 'hotmail.con', correct: 'hotmail.com' },
          { wrong: 'outlook.con', correct: 'outlook.com' },
        ];

        for (const typo of commonTypos) {
          if (value.toLowerCase().includes(typo.wrong)) {
            return `Did you mean ${value.toLowerCase().replace(typo.wrong, typo.correct)}?`;
          }
        }

        return 'Please enter a valid email address';
      }
    }

    if (rules.mobile) {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        return 'Mobile number must be 10 digits';
      }
      if (!/^[6-9]/.test(cleaned)) {
        return 'Mobile number must start with 6, 7, 8, or 9';
      }
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      return `Value must be at least ${rules.min}`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return `Value must not exceed ${rules.max}`;
    }

    if (rules.minAge || rules.maxAge) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      if (rules.minAge && actualAge < rules.minAge) {
        return `Age must be at least ${rules.minAge} years`;
      }

      if (rules.maxAge && actualAge > rules.maxAge) {
        return `Age must not exceed ${rules.maxAge} years`;
      }
    }

    if (rules.pastDate) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate >= today) {
        return 'Date must be in the past';
      }
    }

    if (rules.futureDate) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return 'Date must be today or in the future';
      }
    }

    if (rules.maxDaysAhead) {
      const selectedDate = new Date(value);
      const today = new Date();
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + rules.maxDaysAhead);
      if (selectedDate > maxDate) {
        return `Date must be within ${rules.maxDaysAhead} days`;
      }
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrors(prev => {
      if (error === null) {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
      return { ...prev, [fieldName]: error };
    });
  }, []);

  const validateFieldAndSet = useCallback((fieldName: string, value: any, rules: ValidationRule) => {
    const error = validateField(fieldName, value, rules);
    setFieldError(fieldName, error);
    return error === null;
  }, [validateField, setFieldError]);

  const validateAll = useCallback((formData: Record<string, any>, rules: ValidationRules): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName], rules[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField]);

  const clearError = useCallback((fieldName: string) => {
    setFieldError(fieldName, null);
  }, [setFieldError]);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField: validateFieldAndSet,
    validateAll,
    clearError,
    clearAllErrors,
  };
}

export function formatMobileNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) {
    return cleaned;
  }
  return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
}

export function countCompletedRequiredFields(formData: Record<string, any>, rules: ValidationRules): { completed: number; total: number } {
  const requiredFields = Object.keys(rules).filter(key => rules[key].required);
  const completed = requiredFields.filter(key => {
    const value = formData[key];
    return value && (typeof value !== 'string' || value.trim() !== '');
  }).length;

  return { completed, total: requiredFields.length };
}
