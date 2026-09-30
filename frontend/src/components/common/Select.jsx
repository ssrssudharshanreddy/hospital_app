import React from 'react';

export default function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  required = false,
  disabled = false,
  error,
  helperText,
  style = {},
  selectStyle = {},
  ...props
}) {
  const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '_') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
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
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={{
          padding: '0.55rem 0.75rem',
          fontSize: '0.9rem',
          borderRadius: '6px',
          border: `1px solid ${error ? '#ef4444' : '#cbd5e1'}`,
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          color: disabled ? '#94a3b8' : '#0f172a',
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: error ? '0 0 0 1px #ef4444' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...selectStyle
        }}
        onFocus={(e) => {
          if (!disabled && !error) {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
          }
        }}
        onBlur={(e) => {
          if (!disabled && !error) {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt, idx) => {
          if (typeof opt === 'string' || typeof opt === 'number') {
            return (
              <option key={idx} value={opt}>
                {opt}
              </option>
            );
          }
          return (
            <option key={opt.value ?? idx} value={opt.value}>
              {opt.label ?? opt.value}
            </option>
          );
        })}
      </select>
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
