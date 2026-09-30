import React from 'react';
import Modal from './Modal';
import Button from './Button';

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
        <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>
          {confirmVariant === 'danger' ? '⚠️' : '❓'}
        </div>
        <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
