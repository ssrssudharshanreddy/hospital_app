import React from 'react';
import { SpinnerIcon } from './Icons';

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
      borderRadius: 'var(--radius-sm, 6px)',
      gap: '0.35rem',
      height: '32px',
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      borderRadius: 'var(--radius-sm, 6px)',
      gap: '0.5rem',
      height: '38px',
    },
    lg: {
      padding: '0.65rem 1.25rem',
      fontSize: '0.95rem',
      borderRadius: 'var(--radius-md, 8px)',
      gap: '0.6rem',
      height: '44px',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const baseStyle = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    border: '1px solid transparent',
    transition: 'all var(--transition-fast, 0.15s ease)',
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    boxSizing: 'border-box',
    ...currentSize,
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary, #2563eb)',
      color: '#ffffff',
      borderColor: 'var(--primary, #2563eb)',
    },
    secondary: {
      backgroundColor: 'var(--surface-muted, #f1f5f9)',
      color: 'var(--text-main, #172033)',
      borderColor: 'var(--border, #e4e7ec)',
    },
    success: {
      backgroundColor: 'var(--status-completed, #16a34a)',
      color: '#ffffff',
      borderColor: 'var(--status-completed, #16a34a)',
    },
    danger: {
      backgroundColor: 'var(--status-emergency, #dc2626)',
      color: '#ffffff',
      borderColor: 'var(--status-emergency, #dc2626)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-main, #172033)',
      borderColor: 'var(--border, #e4e7ec)',
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
          if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary-hover, #1d4ed8)';
          if (variant === 'secondary') e.currentTarget.style.backgroundColor = '#e2e8f0';
          if (variant === 'success') e.currentTarget.style.backgroundColor = '#15803d';
          if (variant === 'danger') e.currentTarget.style.backgroundColor = '#b91c1c';
          if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = 'var(--surface-alt, #f8fafc)';
            e.currentTarget.style.borderColor = 'var(--border-strong, #cbd5e1)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          const orig = variantStyles[variant] || variantStyles.primary;
          e.currentTarget.style.backgroundColor = orig.backgroundColor;
          e.currentTarget.style.borderColor = orig.borderColor;
        }
      }}
      {...props}
    >
      {loading ? (
        <SpinnerIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : icon ? (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
