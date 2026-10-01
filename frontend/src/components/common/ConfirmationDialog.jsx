import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertIcon, InfoIcon } from './Icons';

export default function ConfirmationDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-full, 9999px)',
          backgroundColor: confirmVariant === 'danger' ? 'var(--status-emergency-bg, #fee2e2)' : 'var(--primary-subtle, #eff6ff)',
          color: confirmVariant === 'danger' ? 'var(--status-emergency, #dc2626)' : 'var(--primary, #2563eb)',
          flexShrink: 0
        }}>
          {confirmVariant === 'danger' ? <AlertIcon size={20} /> : <InfoIcon size={20} />}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-main, #172033)', lineHeight: 1.5, marginTop: '0.35rem' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
