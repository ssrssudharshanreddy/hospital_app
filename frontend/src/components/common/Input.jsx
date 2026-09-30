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
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          {label}
          {required && <span style={{ color: '#dc2626' }}>*</span>}
          {readOnly && <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '400' }}>(Read-only)</span>}
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
          fontSize: '0.9rem',
          borderRadius: '6px',
          border: `1px solid ${error ? '#ef4444' : '#cbd5e1'}`,
          backgroundColor: readOnly ? '#f8fafc' : disabled ? '#f1f5f9' : '#ffffff',
          color: readOnly ? '#475569' : disabled ? '#94a3b8' : '#0f172a',
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: error ? '0 0 0 1px #ef4444' : 'none',
          cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
          ...inputStyle
        }}
        onFocus={(e) => {
          if (!readOnly && !disabled && !error) {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
          }
        }}
        onBlur={(e) => {
          if (!readOnly && !disabled && !error) {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
