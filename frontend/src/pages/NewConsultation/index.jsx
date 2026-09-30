import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DoctorSelector from '../../components/doctors/DoctorSelector';
import PatientDetails from '../../components/patients/PatientDetails';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';

export default function NewConsultationPage() {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';

  const [patientIdInput, setPatientIdInput] = useState(initialPatientId);
  const [patient, setPatient] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [healthIssue, setHealthIssue] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdConsultation, setCreatedConsultation] = useState(null);

  // Fetch doctors on mount
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

  // Auto lookup if patientId query parameter is provided
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!patient) {
      setError('Please verify the patient identity first before registering a consultation.');
      return;
    }
    if (!selectedDoctorId) {
      setError('Please select an attending doctor.');
      return;
    }
    if (!healthIssue.trim()) {
      setError('Chief health complaint / symptoms cannot be blank.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.registerConsultation({
        patientId: patient.patientId,
        doctorId: parseInt(selectedDoctorId, 10),
        healthIssue: healthIssue.trim(),
        emergency: isEmergency,
      });

      if (res && res.data) {
        setCreatedConsultation(res.data);
        // Reset form inputs for next entry
        setHealthIssue('');
        setSelectedDoctorId('');
        setIsEmergency(false);
      }
    } catch (err) {
      // Backend handles duplicate active consultation rejection with 409 Conflict
      setError(err.message || 'Failed to register consultation.');
    } finally {
      setLoading(false);
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
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
          New Consultation Registration
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          Queue patient for medical encounter with automatic common token generation
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Prominent Success Display Box */}
      {createdConsultation && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🎟️</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#166534' }}>
                Consultation Registered Successfully
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: createdConsultation.emergency ? '#fef2f2' : '#eff6ff',
                color: createdConsultation.emergency ? '#dc2626' : '#2563eb',
                border: `1px solid ${createdConsultation.emergency ? '#fecaca' : '#bfdbfe'}`,
              }}
            >
              {createdConsultation.emergency ? 'EMERGENCY PRIORITY' : 'NORMAL (FIFO)'}
            </span>
          </div>

          {/* Prominent Token Display */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '2px dashed #bbf7d0',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                Assigned Common Token
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: createdConsultation.emergency ? '#dc2626' : '#2563eb',
                  letterSpacing: '0.05em',
                }}
              >
                Token {createdConsultation.formattedToken || String(createdConsultation.tokenNo).padStart(3, '0')}
              </div>
            </div>
          </div>

          {/* Consultation Summary Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #dcfce7',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient:</span>
              <p style={{ fontWeight: '600', color: '#0f172a' }}>
                {createdConsultation.patientName} (ID: #{createdConsultation.patientId})
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Attending Doctor:</span>
              <p style={{ fontWeight: '600', color: '#0f172a' }}>
                {createdConsultation.doctorName}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Room Number:</span>
              <p style={{ fontWeight: '700', color: '#2563eb' }}>
                Room {createdConsultation.roomNo}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Status:</span>
              <p style={{ fontWeight: '700', color: '#d97706' }}>
                {createdConsultation.status || 'Waiting'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={handleBookAnother}>
              + Register Another Consultation
            </Button>
            <Link to="/doctor-queues" style={{ textDecoration: 'none' }}>
              <Button variant="outline">
                View in Doctor Queues
              </Button>
            </Link>
            <Link to="/consultations" style={{ textDecoration: 'none' }}>
              <Button variant="outline">
                Consultation History
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Step 1: Patient Verification */}
      <Card title="1. Patient Identity Lookup">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Patient ID"
              name="patientId"
              type="number"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              placeholder="Enter permanent Patient ID (e.g. 101)"
              required
              helperText="Enter Patient ID to retrieve verified profile"
              style={{ marginBottom: 0 }}
            />
          </div>
          <Button variant="primary" onClick={() => handleLookup()} loading={lookingUp}>
            Verify Patient
          </Button>
        </div>

        {patient && (
          <div style={{ marginTop: '1.25rem' }}>
            <PatientDetails patient={patient} />
          </div>
        )}
      </Card>

      {/* Step 2: Consultation Details */}
      <Card title="2. Consultation Details">
        <form onSubmit={handleSubmit}>
          {/* Read-Only Notice */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.8rem',
              color: '#475569',
              marginBottom: '1.25rem',
            }}
          >
            📋 Patient details above are loaded as read-only. Token number and queue position are assigned automatically by the C++ engine upon registration.
          </div>

          {/* Doctor Selection (Manual selection by registration desk, no automatic doctor assignment) */}
          <DoctorSelector
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onChange={setSelectedDoctorId}
            required
            helperText="Select physician and assigned consulting room"
          />

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#334155',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              Chief Health Issue / Symptoms <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              name="healthIssue"
              value={healthIssue}
              onChange={(e) => setHealthIssue(e.target.value)}
              placeholder="Describe primary health complaint (e.g. Acute chest pain, high fever, abdominal cramps)..."
              rows={3}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                fontSize: '0.9rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Priority Toggle */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: isEmergency ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${isEmergency ? '#fecaca' : '#e2e8f0'}`,
              marginBottom: '1.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isEmergency ? '#991b1b' : '#1e293b' }}>
                  Consultation Priority: {isEmergency ? 'EMERGENCY' : 'Normal (Standard)'}
                </span>
                <p style={{ fontSize: '0.8rem', color: isEmergency ? '#b91c1c' : '#64748b', marginTop: '0.15rem' }}>
                  {isEmergency
                    ? 'Emergency consultations bypass the normal queue and are called next in turn.'
                    : 'Standard consultations are enqueued into the doctor\'s FIFO normal queue.'}
                </p>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#dc2626' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#dc2626' }}>
                  Emergency Case
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setPatient(null);
                setPatientIdInput('');
                setHealthIssue('');
                setSelectedDoctorId('');
                setIsEmergency(false);
              }}
            >
              Reset
            </Button>
            <Button variant="primary" type="submit" loading={loading} disabled={!patient}>
              Register Consultation & Issue Token
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
