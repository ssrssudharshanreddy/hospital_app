import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  icon,
  style = {},
  ...props
}) {
  const sizeStyles = {
    sm: {
      padding: '0.35rem 0.75rem',
      fontSize: '0.8rem',
      borderRadius: '5px',
      gap: '0.35rem',
    },
    md: {
      padding: '0.55rem 1.1rem',
      fontSize: '0.875rem',
      borderRadius: '6px',
      gap: '0.5rem',
    },
    lg: {
      padding: '0.75rem 1.4rem',
      fontSize: '1rem',
      borderRadius: '8px',
      gap: '0.65rem',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const baseStyle = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    border: 'none',
    transition: 'all 0.15s ease',
    opacity: disabled || loading ? 0.65 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    ...currentSize,
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#e2e8f0',
      color: '#1e293b',
    },
    success: {
      backgroundColor: '#16a34a',
      color: '#ffffff',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#334155',
      border: '1px solid #cbd5e1',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...baseStyle,
        ...(variantStyles[variant] || variantStyles.primary),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary') e.currentTarget.style.backgroundColor = '#1d4ed8';
          if (variant === 'secondary') e.currentTarget.style.backgroundColor = '#cbd5e1';
          if (variant === 'success') e.currentTarget.style.backgroundColor = '#15803d';
          if (variant === 'danger') e.currentTarget.style.backgroundColor = '#b91c1c';
          if (variant === 'outline') e.currentTarget.style.backgroundColor = '#f1f5f9';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          const orig = variantStyles[variant] || variantStyles.primary;
          e.currentTarget.style.backgroundColor = orig.backgroundColor;
        }
      }}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
