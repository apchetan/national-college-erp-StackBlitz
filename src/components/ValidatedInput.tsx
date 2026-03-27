import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, useState, useEffect } from 'react';
import { formatMobileNumber } from '../hooks/useFormValidation';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

type ValidatedInputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & {
  type?: 'text' | 'email' | 'tel' | 'date' | 'number';
  autoFormat?: 'mobile';
};

type ValidatedTextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

type ValidatedSelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
};

export function ValidatedInput({
  label,
  error,
  hint,
  required,
  className = '',
  onBlur,
  onFocus,
  autoFormat,
  ...props
}: ValidatedInputProps) {
  const [displayValue, setDisplayValue] = useState(props.value as string || '');

  useEffect(() => {
    if (autoFormat === 'mobile' && props.value) {
      setDisplayValue(formatMobileNumber(props.value as string));
    } else {
      setDisplayValue(props.value as string || '');
    }
  }, [props.value, autoFormat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (autoFormat === 'mobile') {
      const cleaned = value.replace(/\D/g, '');
      setDisplayValue(formatMobileNumber(cleaned));
      if (props.onChange) {
        e.target.value = cleaned;
        props.onChange(e);
      }
    } else {
      setDisplayValue(value);
      if (props.onChange) {
        props.onChange(e);
      }
    }
  };

  const baseInputClass = `w-full px-4 py-2 rounded-lg transition ${
    error
      ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  } ${className}`;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={baseInputClass}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.name}-error` : hint ? `${props.name}-hint` : undefined}
      />
      {hint && !error && (
        <p className="text-xs text-gray-500" id={`${props.name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-start gap-1" id={`${props.name}-error`}>
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function ValidatedTextarea({
  label,
  error,
  hint,
  required,
  className = '',
  onBlur,
  onFocus,
  ...props
}: ValidatedTextareaProps) {
  const baseTextareaClass = `w-full px-4 py-2 rounded-lg transition ${
    error
      ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  } ${className}`;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        {...props}
        onBlur={onBlur}
        onFocus={onFocus}
        className={baseTextareaClass}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.name}-error` : hint ? `${props.name}-hint` : undefined}
      />
      {hint && !error && (
        <p className="text-xs text-gray-500" id={`${props.name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-start gap-1" id={`${props.name}-error`}>
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function ValidatedSelect({
  label,
  error,
  hint,
  required,
  className = '',
  children,
  onBlur,
  onFocus,
  ...props
}: ValidatedSelectProps) {
  const baseSelectClass = `w-full px-4 py-2 rounded-lg transition ${
    error
      ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  } ${className}`;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        {...props}
        onBlur={onBlur}
        onFocus={onFocus}
        className={baseSelectClass}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.name}-error` : hint ? `${props.name}-hint` : undefined}
      >
        {children}
      </select>
      {hint && !error && (
        <p className="text-xs text-gray-500" id={`${props.name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-start gap-1" id={`${props.name}-error`}>
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
