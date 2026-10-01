import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '550px'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        style={{
          backgroundColor: 'var(--surface, #ffffff)',
          borderRadius: 'var(--radius-lg, 12px)',
          width: '100%',
          maxWidth,
          boxShadow: 'var(--shadow-lg, 0 12px 16px -4px rgba(16, 24, 40, 0.08))',
          border: '1px solid var(--border, #e4e7ec)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border, #e4e7ec)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface, #ffffff)'
          }}
        >
          {title && (
            <h3 id="modal-title" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #667085)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--radius-xs, 4px)',
              transition: 'background-color var(--transition-fast, 0.15s ease)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-muted, #f1f5f9)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid var(--border, #e4e7ec)',
              backgroundColor: 'var(--surface-alt, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.5rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
