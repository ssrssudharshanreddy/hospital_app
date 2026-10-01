import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DoctorSelector from '../../components/doctors/DoctorSelector';
import PatientDetails from '../../components/patients/PatientDetails';
import ErrorMessage from '../../components/common/ErrorMessage';
import Badge from '../../components/common/Badge';
import {
  CheckIcon,
  SearchIcon,
  QueueIcon,
  ArrowRightIcon,
  AlertIcon,
} from '../../components/common/Icons';
import api from '../../services/api';

export default function NewConsultationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPatientId = searchParams.get('patientId') || '';

  const [step, setStep] = useState(1);
  const [patientIdInput, setPatientIdInput] = useState(initialPatientId);
  const [patient, setPatient] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [healthIssue, setHealthIssue] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdConsultation, setCreatedConsultation] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.getDoctors();
        if (res && res.data && res.data.doctors) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('Failed to load doctors list:', err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (initialPatientId) {
      handleLookup(initialPatientId);
    }
  }, [initialPatientId]);

  const handleLookup = async (idToLookup) => {
    const id = idToLookup || patientIdInput;
    if (!id) {
      setError('Please enter a Patient ID to lookup.');
      return;
    }
    setError(null);
    setLookingUp(true);
    try {
      const res = await api.getPatientById(parseInt(id, 10));
      if (res && res.data) {
        setPatient(res.data);
      }
    } catch (err) {
      setPatient(null);
      setError(err.message || `No patient found with ID ${id}. Register the patient first.`);
    } finally {
      setLookingUp(false);
    }
  };

  const handleNextToStep2 = () => {
    if (!patient) {
      setError('Please find and verify the patient first.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextToStep3 = () => {
    if (!selectedDoctorId) {
      setError('Please select an attending doctor.');
      return;
    }
    if (!healthIssue.trim()) {
      setError('Health issue / chief complaint cannot be blank.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.registerConsultation({
        patientId: patient.patientId,
        doctorId: parseInt(selectedDoctorId, 10),
        healthIssue: healthIssue.trim(),
        emergency: isEmergency,
      });

      if (res && res.data) {
        setCreatedConsultation(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to register consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setCreatedConsultation(null);
    setPatient(null);
    setPatientIdInput('');
    setHealthIssue('');
    setSelectedDoctorId('');
    setIsEmergency(false);
    setError(null);
    setStep(1);
  };

  const selectedDoctor = doctors.find((d) => d.doctorId === Number(selectedDoctorId));

  if (createdConsultation) {
    const formattedToken = createdConsultation.formattedToken || String(createdConsultation.tokenNo).padStart(3, '0');
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div
          style={{
            backgroundColor: 'var(--surface, #ffffff)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border, #e4e7ec)',
            boxShadow: 'var(--shadow-md)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full, 9999px)',
              backgroundColor: 'var(--status-completed-bg, #dcfce7)',
              color: 'var(--status-completed, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <CheckIcon size={24} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main, #172033)' }}>
            Consultation Registered
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.25rem' }}>
            Patient has been placed into the queue
          </p>

          <div
            style={{
              margin: '1.5rem 0',
              padding: '1.5rem',
              backgroundColor: createdConsultation.emergency ? 'var(--status-emergency-bg, #fee2e2)' : 'var(--primary-subtle, #eff6ff)',
              borderRadius: 'var(--radius-md, 8px)',
              border: `1px solid ${createdConsultation.emergency ? 'var(--status-emergency-border, #fecaca)' : 'var(--primary-border, #bfdbfe)'}`,
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary, #667085)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              YOUR TOKEN
            </div>
            <div
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '48px',
                fontWeight: '800',
                color: createdConsultation.emergency ? 'var(--status-emergency, #dc2626)' : 'var(--primary, #2563eb)',
                lineHeight: 1.1,
                marginTop: '0.25rem',
                letterSpacing: '0.04em',
              }}
            >
              {formattedToken}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
              backgroundColor: 'var(--surface-alt, #f8fafc)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #e4e7ec)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Patient:</span>
              <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '14px' }}>
                {createdConsultation.patientName}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Doctor:</span>
              <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '14px' }}>
                {createdConsultation.doctorName}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Room:</span>
              <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '14px' }}>
                Room {createdConsultation.roomNo}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Priority:</span>
              <div>
                <Badge variant={createdConsultation.emergency ? 'emergency' : 'normal'} size="sm">
                  {createdConsultation.emergency ? 'Emergency' : 'Normal'}
                </Badge>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={`/doctor-queues?doctorId=${createdConsultation.doctorId}`} style={{ textDecoration: 'none' }}>
              <Button variant="outline">
                View Doctor Queue
              </Button>
            </Link>
            <Button variant="primary" onClick={handleBookAnother}>
              Register Another Consultation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
          New Consultation
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
          3-step consultation registration and token assignment
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--surface, #ffffff)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border, #e4e7ec)',
          padding: '0.75rem 1rem',
          justifyContent: 'space-between',
        }}
      >
        {[
          { num: 1, label: 'Find Patient' },
          { num: 2, label: 'Consultation Details' },
          { num: 3, label: 'Review & Confirm' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: s.num < step ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: step === s.num ? 'var(--primary, #2563eb)' : step > s.num ? 'var(--status-completed, #16a34a)' : 'var(--surface-muted, #f1f5f9)',
                  color: step >= s.num ? '#ffffff' : 'var(--text-secondary, #667085)',
                }}
              >
                {step > s.num ? <CheckIcon size={14} /> : s.num}
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: step === s.num ? '600' : '400',
                  color: step === s.num ? 'var(--text-main, #172033)' : 'var(--text-secondary, #667085)',
                }}
              >
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <span style={{ color: 'var(--border, #e4e7ec)' }}>&mdash;</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {step === 1 && (
        <Card title="Step 1: Find Patient">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Patient ID"
                name="patientId"
                type="number"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                placeholder="Enter Patient ID (e.g. 101)"
                required
                style={{ marginBottom: 0 }}
              />
            </div>
            <Button variant="primary" onClick={() => handleLookup()} loading={lookingUp} icon={<SearchIcon size={16} />}>
              Find Patient
            </Button>
          </div>

          {patient ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PatientDetails patient={patient} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light, #f1f5f9)' }}>
                <Button variant="primary" onClick={handleNextToStep2} icon={<ArrowRightIcon size={16} />}>
                  Continue to Consultation Details
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary, #667085)', padding: '1rem 0' }}>
              Enter the patient's permanent ID to retrieve their verified record.
            </div>
          )}
        </Card>
      )}

      {step === 2 && (
        <Card title="Step 2: Consultation Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                backgroundColor: 'var(--surface-alt, #f8fafc)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e4e7ec)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Patient:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main, #172033)', marginLeft: '0.4rem' }}>
                  {patient.patientName} (#{patient.patientId})
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Change Patient
              </Button>
            </div>

            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-main, #172033)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                Health Issue <span style={{ color: 'var(--status-emergency, #dc2626)' }}>*</span>
              </label>
              <textarea
                value={healthIssue}
                onChange={(e) => setHealthIssue(e.target.value)}
                placeholder="Describe patient health issue or symptoms..."
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #e4e7ec)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <DoctorSelector
              doctors={doctors}
              selectedDoctorId={selectedDoctorId}
              onChange={setSelectedDoctorId}
              required
              label="Doctor"
            />

            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-main, #172033)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Priority
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div
                  onClick={() => setIsEmergency(false)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: `1.5px solid ${!isEmergency ? 'var(--primary, #2563eb)' : 'var(--border, #e4e7ec)'}`,
                    backgroundColor: !isEmergency ? 'var(--primary-subtle, #eff6ff)' : 'var(--surface, #ffffff)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast, 0.15s ease)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: !isEmergency ? 'var(--primary, #2563eb)' : 'var(--text-main, #172033)' }}>
                      Normal
                    </span>
                    <Badge variant="normal" size="sm">FIFO</Badge>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>
                    Standard consultation order
                  </p>
                </div>

                <div
                  onClick={() => setIsEmergency(true)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: `1.5px solid ${isEmergency ? 'var(--status-emergency, #dc2626)' : 'var(--border, #e4e7ec)'}`,
                    backgroundColor: isEmergency ? 'var(--status-emergency-bg, #fee2e2)' : 'var(--surface, #ffffff)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast, 0.15s ease)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: isEmergency ? 'var(--status-emergency, #dc2626)' : 'var(--text-main, #172033)' }}>
                      Emergency
                    </span>
                    <Badge variant="emergency" size="sm">Priority</Badge>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>
                    Called before normal queue
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-light, #f1f5f9)' }}>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" onClick={handleNextToStep3} icon={<ArrowRightIcon size={16} />}>
                Review & Confirm
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="Step 3: Review & Confirm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                backgroundColor: 'var(--surface-alt, #f8fafc)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border, #e4e7ec)',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Patient:</span>
                <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '14px', marginTop: '0.15rem' }}>
                  {patient.patientName} (#{patient.patientId})
                </p>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Doctor:</span>
                <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '14px', marginTop: '0.15rem' }}>
                  {selectedDoctor?.doctorName}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Room:</span>
                <p style={{ fontWeight: '600', color: 'var(--text-main, #172033)', fontSize: '14px', marginTop: '0.15rem' }}>
                  Room {selectedDoctor?.roomNo}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Priority:</span>
                <div style={{ marginTop: '0.15rem' }}>
                  <Badge variant={isEmergency ? 'emergency' : 'normal'} size="sm">
                    {isEmergency ? 'Emergency' : 'Normal'}
                  </Badge>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--surface, #ffffff)',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e4e7ec)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', fontWeight: '600', textTransform: 'uppercase' }}>
                Health Issue:
              </span>
              <p style={{ fontSize: '14px', color: 'var(--text-main, #172033)', marginTop: '0.25rem' }}>
                {healthIssue}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-light, #f1f5f9)' }}>
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Edit
              </Button>
              <Button variant="primary" onClick={handleSubmit} loading={submitting}>
                Register Consultation
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
