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
import api from '../../services/api';

export default function ProcessPatientPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [lastProcessed, setLastProcessed] = useState(null);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // 1. Load doctors
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

  // 2. Fetch current doctor queue
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
      setLastProcessed(null);
    }
  }, [selectedDoctorId]);

  // Handle calling next patient (Waiting -> In Consultation)
  const handleCallNext = async () => {
    if (!selectedDoctorId) return;
    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      const res = await api.processNextPatient(selectedDoctorId);
      if (res && res.data) {
        setSuccess(
          `Patient called into consultation! Token #${res.data.tokenNo} (${res.data.patientName}) is now In Consultation.`
        );
        await fetchQueue(selectedDoctorId);
      }
    } catch (err) {
      setError(err.message || 'Failed to call next patient.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle completing consultation (In Consultation -> Completed)
  const handleCompleteConsultation = async () => {
    if (!selectedDoctorId) return;
    setError(null);
    setSuccess(null);
    setCompleting(true);

    try {
      const res = await api.completeConsultation(selectedDoctorId);
      if (res && res.data) {
        setLastProcessed(res.data);
        setSuccess(
          `Consultation completed! Token #${res.data.tokenNo} (${res.data.patientName}) marked as Completed in C++ core & MongoDB.`
        );
        await fetchQueue(selectedDoctorId);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete consultation.');
    } finally {
      setCompleting(false);
    }
  };

  // Handle cancelling waiting patient
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
        setSuccess(`Token #${token} was cancelled and removed from active queue.`);
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
  const isCurrentEmergency = currentPatient?.emergency;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
          Process Patient Consultation
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          Doctor consulting interface: Call waiting patients, manage active consultations, and complete encounters
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      {/* Doctor Selection */}
      <Card>
        <div style={{ maxWidth: '420px' }}>
          <DoctorSelector
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onChange={(id) => setSelectedDoctorId(id)}
            label="Active Consulting Doctor"
          />
        </div>
      </Card>

      {/* Last Processed Patient Notice */}
      {lastProcessed && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
              Last Completed Encounter
            </span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>
              Token {lastProcessed.formattedToken || String(lastProcessed.tokenNo).padStart(3, '0')}: {lastProcessed.patientName} (ID: #{lastProcessed.patientId})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Issue: {lastProcessed.healthIssue} &bull; Room {lastProcessed.roomNo}
            </div>
          </div>
          <Badge variant="completed" size="md">
            COMPLETED
          </Badge>
        </div>
      )}

      {/* SECTION 1: CURRENTLY CONSULTING (ACTIVE ENCOUNTER) */}
      {currentPatient && (
        <Card
          title="CURRENTLY CONSULTING"
          subtitle={`Doctor is currently examining patient in Room ${queueData?.doctor?.roomNo}`}
          style={{
            borderLeft: '5px solid #7c3aed',
            backgroundColor: '#faf5ff',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '2.25rem',
                    fontWeight: '800',
                    padding: '0.35rem 0.95rem',
                    borderRadius: '8px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  Token {currentPatient.formattedToken || String(currentPatient.tokenNo).padStart(3, '0')}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
                    {currentPatient.patientName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
                      Patient ID: #{currentPatient.patientId}
                    </span>
                    <ConsultationStatusBadge status="In Consultation" />
                    {isCurrentEmergency && (
                      <Badge variant="emergency" size="sm">
                        EMERGENCY
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.4rem 0.85rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #ddd6fe',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#6b21a8',
                }}
              >
                Room {queueData?.doctor?.roomNo}
              </div>
            </div>

            {/* Health Issue */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e9d5ff',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase' }}>
                Reported Chief Health Issue:
              </span>
              <p style={{ fontSize: '1rem', color: '#1e293b', marginTop: '0.25rem', fontWeight: '600' }}>
                {currentPatient.healthIssue || 'General medical consultation.'}
              </p>
            </div>

            {/* Complete Consultation Action Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e9d5ff',
              }}
            >
              <Button
                variant="success"
                size="lg"
                onClick={handleCompleteConsultation}
                loading={completing}
              >
                ✓ Complete Consultation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 2: WAITING QUEUE / CALL NEXT PATIENT */}
      {loading && !queueData ? (
        <LoadingState message="Checking waiting queue..." />
      ) : nextPatient ? (
        <Card
          title={currentPatient ? 'Next Waiting Patient in Line' : 'Patient Currently In Turn'}
          subtitle={`Priority handled by C++ DSA: ${isEmergency ? 'EMERGENCY OVERRIDES NORMAL' : 'NORMAL FIFO ORDER'}`}
          style={{
            borderLeft: `5px solid ${isEmergency ? '#dc2626' : '#2563eb'}`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '2.25rem',
                    fontWeight: '800',
                    padding: '0.35rem 0.95rem',
                    borderRadius: '8px',
                    backgroundColor: isEmergency ? '#dc2626' : '#2563eb',
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  Token {nextPatient.formattedToken || String(nextPatient.tokenNo).padStart(3, '0')}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                    {nextPatient.patientName || `Patient #${nextPatient.patientId}`}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Patient #{nextPatient.patientId}
                    </span>
                    <Badge variant={isEmergency ? 'emergency' : 'normal'}>
                      {isEmergency ? 'EMERGENCY PRIORITY' : 'Standard Appointment'}
                    </Badge>
                    <Badge variant="waiting" size="sm">
                      Waiting
                    </Badge>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.4rem 0.85rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#334155',
                }}
              >
                Room {queueData?.doctor?.roomNo}
              </div>
            </div>

            {/* Health Issue Card */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Reported Chief Health Issue:
              </span>
              <p style={{ fontSize: '0.95rem', color: '#1e293b', marginTop: '0.25rem', fontWeight: '600' }}>
                {nextPatient.healthIssue || 'General medical consultation.'}
              </p>
            </div>

            {/* In-Consultation Guard Notice */}
            {currentPatient && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fffbeb',
                  borderRadius: '6px',
                  border: '1px solid #fde68a',
                  fontSize: '0.85rem',
                  color: '#b45309',
                  fontWeight: '600',
                }}
              >
                Doctor is currently consulting with Token #{currentPatient.tokenNo} ({currentPatient.patientName}). Complete the active consultation above before calling this patient.
              </div>
            )}

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <Button
                variant="danger"
                size="md"
                onClick={() => setShowCancelDialog(true)}
                disabled={processing || completing}
              >
                Cancel Consultation
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleCallNext}
                loading={processing}
                disabled={!!currentPatient || completing}
              >
                {currentPatient ? 'Doctor Busy (Consulting)' : '📞 Call Patient (In Consultation)'}
              </Button>
            </div>
          </div>
        </Card>
      ) : !currentPatient ? (
        <EmptyState
          title="No Patients Waiting in Queue"
          description={`Doctor ${queueData?.doctor?.doctorName || ''} currently has zero patients waiting in line.`}
          icon="☕"
          actionButton={
            <Button variant="outline" onClick={() => fetchQueue(selectedDoctorId)}>
              Refresh Queue
            </Button>
          }
        />
      ) : null}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        title="Cancel Active Consultation"
        message={`Are you sure you want to cancel Token #${nextPatient?.tokenNo}? This consultation will be removed from the active queue and its token will NEVER be reused.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleCancelConsultation}
        onCancel={() => setShowCancelDialog(false)}
        loading={processing}
      />
    </div>
  );
}
