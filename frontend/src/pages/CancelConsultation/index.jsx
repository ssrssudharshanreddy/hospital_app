import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ConsultationStatusBadge from '../../components/consultations/ConsultationStatusBadge';
import Badge from '../../components/common/Badge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import { SearchIcon, AlertIcon } from '../../components/common/Icons';
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
          `Token #${consultation.tokenNo} was cancelled successfully. It has been removed from the queue and its token will not be reused.`
        );
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
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
          Cancel Consultation
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
          Search for an active consultation and cancel it from the queue
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
            <Button variant="primary" type="submit" loading={loading} icon={<SearchIcon size={16} />}>
              Find Token
            </Button>
          </div>
        </form>
      </Card>

      {consultation && (
        <Card title={`Consultation Record: Token #${consultation.tokenNo}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Patient:</span>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--surface-alt, #f8fafc)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e4e7ec)',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12px' }}>Doctor:</span>
                <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', marginTop: '0.15rem' }}>{consultation.doctorName}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12px' }}>Room:</span>
                <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', marginTop: '0.15rem' }}>Room {consultation.roomNo}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12px' }}>Priority:</span>
                <div style={{ marginTop: '0.15rem' }}>
                  <Badge variant={consultation.emergency ? 'emergency' : 'normal'} size="sm">
                    {consultation.emergency ? 'Emergency' : 'Normal'}
                  </Badge>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12px' }}>Health Issue:</span>
                <p style={{ fontWeight: '500', color: 'var(--text-main, #172033)', marginTop: '0.15rem' }}>{consultation.healthIssue}</p>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--status-waiting-bg, #fef3c7)',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--status-waiting-border, #fde68a)',
                fontSize: '12.5px',
                color: 'var(--status-waiting-text, #92400e)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertIcon size={16} />
              <span>
                <strong>Token Retirement Policy:</strong> Once cancelled, this consultation is removed from the active queue and its token will not be reassigned. The historical record remains available.
              </span>
            </div>

            {isWaiting ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <Button
                  variant="danger"
                  onClick={() => setShowConfirm(true)}
                  disabled={cancelling}
                >
                  Cancel Consultation
                </Button>
              </div>
            ) : (
              <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary, #667085)', fontStyle: 'italic' }}>
                This consultation is {consultation.status} and cannot be cancelled.
              </div>
            )}
          </div>
        </Card>
      )}

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Cancel Consultation"
        message="Are you sure you want to cancel this consultation? This removes the consultation from the active queue. The historical record remains available."
        confirmText="Cancel Consultation"
        cancelText="Keep Consultation"
        confirmVariant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowConfirm(false)}
        loading={cancelling}
      />
    </div>
  );
}
