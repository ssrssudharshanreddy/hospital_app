import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ConsultationStatusBadge from '../../components/consultations/ConsultationStatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import api from '../../services/api';

export default function CancelConsultationPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter a Token Number.');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.getConsultationByToken(parseInt(tokenInput.trim(), 10));
      if (res && res.data) {
        setConsultation(res.data);
      }
    } catch (err) {
      setConsultation(null);
      setError(err.message || `No consultation found with Token #${tokenInput}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!consultation) return;
    setShowConfirm(false);
    setError(null);
    setSuccess(null);
    setCancelling(true);

    try {
      const res = await api.cancelConsultation(consultation.tokenNo);
      if (res && res.data) {
        setSuccess(
          `Token #${consultation.tokenNo} was cancelled successfully. It has been removed from active queues and will NEVER be reused.`
        );
        // Refresh record
        const updated = await api.getConsultationByToken(consultation.tokenNo);
        if (updated && updated.data) {
          setConsultation(updated.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel consultation.');
    } finally {
      setCancelling(false);
    }
  };

  const isWaiting = consultation?.status === 'Waiting';

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
          Cancel Waiting Consultation
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          Remove active consultation from queue with confirmation and non-reuse token preservation
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      <Card title="Lookup Consultation by Token">
        <form onSubmit={handleLookup}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Token Number"
                name="token"
                type="number"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. 1 or 001"
                required
                style={{ marginBottom: 0 }}
              />
            </div>
            <Button variant="primary" type="submit" loading={loading}>
              Lookup Token
            </Button>
          </div>
        </form>
      </Card>

      {consultation && (
        <Card title={`Consultation Record: Token #${consultation.tokenNo}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient:</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  {consultation.patientName} (ID: #{consultation.patientId})
                </h4>
              </div>
              <ConsultationStatusBadge
                status={consultation.status}
                emergency={consultation.emergency}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
                backgroundColor: '#f8fafc',
                padding: '0.85rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Doctor:</span>
                <p style={{ fontWeight: '600' }}>{consultation.doctorName}</p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Room:</span>
                <p style={{ fontWeight: '600' }}>Room {consultation.roomNo}</p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Health Issue:</span>
                <p style={{ fontWeight: '600' }}>{consultation.healthIssue}</p>
              </div>
            </div>

            {/* Academic Rule Box */}
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fffbeb',
                borderRadius: '6px',
                border: '1px solid #fde68a',
                fontSize: '0.8rem',
                color: '#92400e',
              }}
            >
              ⚠️ <strong>Token Non-Reuse Policy:</strong> When a consultation is cancelled, its token is permanently retired. The next patient in line advances forward automatically, and this token will never be reassigned.
            </div>

            {isWaiting ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <Button
                  variant="danger"
                  onClick={() => setShowConfirm(true)}
                  disabled={cancelling}
                >
                  Cancel This Consultation
                </Button>
              </div>
            ) : (
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                This consultation is already {consultation.status} and cannot be cancelled.
              </div>
            )}
          </div>
        </Card>
      )}

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Confirm Cancellation"
        message={`Are you sure you want to cancel Token #${consultation?.tokenNo} (${consultation?.patientName})? This action cannot be undone.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowConfirm(false)}
        loading={cancelling}
      />
    </div>
  );
}
