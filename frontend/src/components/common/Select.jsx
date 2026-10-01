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
          fontSize: '14px',
          borderRadius: 'var(--radius-sm, 6px)',
          border: `1px solid ${error ? 'var(--status-emergency, #dc2626)' : 'var(--border, #e4e7ec)'}`,
          backgroundColor: disabled ? 'var(--surface-muted, #f1f5f9)' : 'var(--surface, #ffffff)',
          color: disabled ? 'var(--text-muted, #94a3b8)' : 'var(--text-main, #172033)',
          outline: 'none',
          transition: 'border-color var(--transition-fast, 0.15s ease), box-shadow var(--transition-fast, 0.15s ease)',
          boxShadow: error ? '0 0 0 1px var(--status-emergency, #dc2626)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxSizing: 'border-box',
          width: '100%',
          ...selectStyle
        }}
        onFocus={(e) => {
          if (!disabled && !error) {
            e.currentTarget.style.borderColor = 'var(--primary, #2563eb)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
          }
        }}
        onBlur={(e) => {
          if (!disabled && !error) {
            e.currentTarget.style.borderColor = 'var(--border, #e4e7ec)';
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
