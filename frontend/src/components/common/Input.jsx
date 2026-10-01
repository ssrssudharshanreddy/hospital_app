import React from 'react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  style = {},
  inputStyle = {},
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '_') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--text-main, #172033)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--status-emergency, #dc2626)' }}>*</span>}
          {readOnly && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #667085)', fontWeight: '400' }}>
              (Read-only)
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        style={{
          padding: '0.55rem 0.75rem',
          fontSize: '14px',
          borderRadius: 'var(--radius-sm, 6px)',
          border: `1px solid ${error ? 'var(--status-emergency, #dc2626)' : 'var(--border, #e4e7ec)'}`,
          backgroundColor: readOnly ? 'var(--surface-alt, #f8fafc)' : disabled ? 'var(--surface-muted, #f1f5f9)' : 'var(--surface, #ffffff)',
          color: readOnly ? 'var(--text-secondary, #667085)' : disabled ? 'var(--text-muted, #94a3b8)' : 'var(--text-main, #172033)',
          outline: 'none',
          transition: 'border-color var(--transition-fast, 0.15s ease), box-shadow var(--transition-fast, 0.15s ease)',
          boxShadow: error ? '0 0 0 1px var(--status-emergency, #dc2626)' : 'none',
          cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
          boxSizing: 'border-box',
          width: '100%',
          ...inputStyle
        }}
        onFocus={(e) => {
          if (!readOnly && !disabled && !error) {
            e.currentTarget.style.borderColor = 'var(--primary, #2563eb)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
          }
        }}
        onBlur={(e) => {
          if (!readOnly && !disabled && !error) {
            e.currentTarget.style.borderColor = 'var(--border, #e4e7ec)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--status-emergency, #dc2626)', fontWeight: '500' }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
