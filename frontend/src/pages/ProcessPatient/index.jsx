import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DoctorSelector from '../../components/doctors/DoctorSelector';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import EmptyState from '../../components/common/EmptyState';
import ConsultationStatusBadge from '../../components/consultations/ConsultationStatusBadge';
import { CheckIcon, CancelIcon, PulseIcon, RefreshIcon } from '../../components/common/Icons';
import api from '../../services/api';

export default function ProcessPatientPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [queueData, setQueueData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.getDoctors();
        if (res && res.data && res.data.doctors && res.data.doctors.length > 0) {
          setDoctors(res.data.doctors);
          setSelectedDoctorId(res.data.doctors[0].doctorId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load doctors list.');
      }
    };
    fetchDoctors();
  }, []);

  const fetchQueue = async (docId) => {
    const id = docId || selectedDoctorId;
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getDoctorQueue(id);
      if (res && res.data) {
        setQueueData(res.data);
      }
    } catch (err) {
      setError(err.message || `Failed to fetch queue for Doctor #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctorId) {
      fetchQueue(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const handleCallNext = async () => {
    if (!selectedDoctorId) return;
    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      const res = await api.processNextPatient(selectedDoctorId);
      if (res && res.data) {
        const token = res.data.formattedToken || String(res.data.tokenNo).padStart(3, '0');
        setSuccess(`Patient called: Token ${token} (${res.data.patientName}) is now In Consultation.`);
        await fetchQueue(selectedDoctorId);
      }
    } catch (err) {
      setError(err.message || 'Failed to call next patient.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!selectedDoctorId) return;
    setError(null);
    setSuccess(null);
    setCompleting(true);

    try {
      const res = await api.completeConsultation(selectedDoctorId);
      if (res && res.data) {
        const token = res.data.formattedToken || String(res.data.tokenNo).padStart(3, '0');
        setSuccess(`Consultation completed for Token ${token} (${res.data.patientName}).`);
        await fetchQueue(selectedDoctorId);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete consultation.');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancelConsultation = async () => {
    if (!queueData || !queueData.nextPatient) return;
    const token = queueData.nextPatient.tokenNo;
    setShowCancelDialog(false);
    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      const res = await api.cancelConsultation(token);
      if (res && res.data) {
        setSuccess(`Consultation for Token #${token} was cancelled and removed from queue.`);
        await fetchQueue(selectedDoctorId);
      }
    } catch (err) {
      setError(err.message || `Failed to cancel Token #${token}.`);
    } finally {
      setProcessing(false);
    }
  };

  const currentPatient = queueData?.currentConsultation;
  const nextPatient = queueData?.nextPatient;
  const isEmergency = nextPatient?.emergency;
  const currentDoctor = queueData?.doctor;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
            Process Patient
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
            Consultation desk console for attending doctors
          </p>
        </div>

        <Button variant="outline" onClick={() => fetchQueue(selectedDoctorId)} loading={loading} icon={<RefreshIcon size={16} />}>
          Refresh Queue
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      <Card>
        <div style={{ maxWidth: '440px' }}>
          <DoctorSelector
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onChange={(id) => setSelectedDoctorId(id)}
            label="Doctor"
          />
        </div>
      </Card>

      {currentPatient && (
        <Card
          title="CURRENTLY CONSULTING"
          subtitle={`Doctor is currently examining patient in Room ${currentDoctor?.roomNo || currentPatient.roomNo}`}
          style={{
            borderLeft: '4px solid var(--status-consulting, #4f46e5)',
            backgroundColor: 'var(--status-consulting-bg, #eef2ff)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: '28px',
                    fontWeight: '800',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--status-consulting, #4f46e5)',
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  Token {currentPatient.formattedToken || String(currentPatient.tokenNo).padStart(3, '0')}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main, #172033)' }}>
                    {currentPatient.patientName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary, #667085)' }}>
                      Patient ID: #{currentPatient.patientId}
                    </span>
                    <ConsultationStatusBadge status="In Consultation" size="sm" />
                    {currentPatient.emergency && (
                      <Badge variant="emergency" size="sm">
                        Emergency
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--surface, #ffffff)',
                  borderRadius: 'var(--radius-xs, 4px)',
                  border: '1px solid var(--status-consulting-border, #c7d2fe)',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--status-consulting-text, #3730a3)',
                }}
              >
                Room {currentDoctor?.roomNo || currentPatient.roomNo}
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--surface, #ffffff)',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--status-consulting-border, #c7d2fe)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--status-consulting-text, #3730a3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Health Issue:
              </span>
              <p style={{ fontSize: '14px', color: 'var(--text-main, #172033)', marginTop: '0.2rem', fontWeight: '500' }}>
                {currentPatient.healthIssue || 'General medical consultation.'}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(199, 210, 254, 0.7)',
              }}
            >
              <Button
                variant="success"
                size="lg"
                onClick={handleCompleteConsultation}
                loading={completing}
                icon={<CheckIcon size={18} />}
              >
                Complete Consultation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading && !queueData ? (
        <LoadingState message="Checking doctor queue..." />
      ) : nextPatient ? (
        <Card
          title={currentPatient ? 'Next Waiting Patient in Queue' : 'Next Patient'}
          subtitle={isEmergency ? 'Emergency patient overrides standard queue order' : 'Standard FIFO queue order'}
          style={{
            borderLeft: `4px solid ${isEmergency ? 'var(--status-emergency, #dc2626)' : 'var(--primary, #2563eb)'}`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: '28px',
                    fontWeight: '800',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: isEmergency ? 'var(--status-emergency, #dc2626)' : 'var(--primary, #2563eb)',
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  Token {nextPatient.formattedToken || String(nextPatient.tokenNo).padStart(3, '0')}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
                    {nextPatient.patientName || `Patient #${nextPatient.patientId}`}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary, #667085)' }}>
                      Patient #{nextPatient.patientId}
                    </span>
                    <Badge variant={isEmergency ? 'emergency' : 'normal'} size="sm">
                      {isEmergency ? 'Emergency' : 'Normal'}
                    </Badge>
                    <Badge variant="waiting" size="sm">
                      Waiting
                    </Badge>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--surface-muted, #f1f5f9)',
                  borderRadius: 'var(--radius-xs, 4px)',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-main, #172033)',
                  border: '1px solid var(--border, #e4e7ec)',
                }}
              >
                Room {currentDoctor?.roomNo}
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--surface-alt, #f8fafc)',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e4e7ec)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary, #667085)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reported Health Issue:
              </span>
              <p style={{ fontSize: '14px', color: 'var(--text-main, #172033)', marginTop: '0.2rem', fontWeight: '500' }}>
                {nextPatient.healthIssue || 'General medical consultation.'}
              </p>
            </div>

            {currentPatient && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--status-waiting-bg, #fef3c7)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--status-waiting-border, #fde68a)',
                  fontSize: '13px',
                  color: 'var(--status-waiting-text, #92400e)',
                  fontWeight: '500',
                }}
              >
                Doctor is currently consulting with Token #{currentPatient.tokenNo} ({currentPatient.patientName}). Complete the active consultation before calling this patient.
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-light, #f1f5f9)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowCancelDialog(true)}
                disabled={processing || completing}
                icon={<CancelIcon size={16} />}
              >
                Cancel Consultation
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleCallNext}
                loading={processing}
                disabled={!!currentPatient || completing}
                icon={<PulseIcon size={18} />}
              >
                {currentPatient ? 'Doctor Busy' : 'Call Patient'}
              </Button>
            </div>
          </div>
        </Card>
      ) : !currentPatient ? (
        <EmptyState
          title="No Patients Waiting in Queue"
          description={`Doctor ${currentDoctor?.doctorName || ''} currently has zero patients waiting in line.`}
          actionButton={
            <Button variant="outline" onClick={() => fetchQueue(selectedDoctorId)}>
              Refresh Queue
            </Button>
          }
        />
      ) : null}

      <ConfirmationDialog
        isOpen={showCancelDialog}
        title="Cancel Waiting Consultation"
        message={`Are you sure you want to cancel Token #${nextPatient?.tokenNo}? This consultation will be removed from the active queue and its token will not be reused.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleCancelConsultation}
        onCancel={() => setShowCancelDialog(false)}
        loading={processing}
      />
    </div>
  );
}
