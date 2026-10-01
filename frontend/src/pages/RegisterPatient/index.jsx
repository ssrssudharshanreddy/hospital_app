import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { InfoIcon, CheckIcon, QueueIcon, RegisterIcon } from '../../components/common/Icons';
import api from '../../services/api';

export default function RegisterPatientPage() {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdPatient, setCreatedPatient] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.patientName.trim()) {
      setError('Patient Name is required.');
      return;
    }
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      setError('Age must be a valid number between 1 and 150.');
      return;
    }
    if (!formData.gender) {
      setError('Gender selection is required.');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.registerPatient({
        patientName: formData.patientName.trim(),
        age: ageNum,
        gender: formData.gender,
        phone: formData.phone.trim(),
      });

      if (res && res.data) {
        setCreatedPatient(res.data);
        setFormData({ patientName: '', age: '', gender: 'Male', phone: '' });
      }
    } catch (err) {
      setError(err.message || 'Unable to register patient.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setCreatedPatient(null);
    setFormData({ patientName: '', age: '', gender: 'Male', phone: '' });
    setError(null);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
          Register Patient
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
          Create a new patient record
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {createdPatient && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--status-completed-bg, #dcfce7)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--status-completed-border, #bbf7d0)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--status-completed, #16a34a)', display: 'flex' }}>
              <CheckIcon size={20} />
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--status-completed-text, #166534)' }}>
              Patient Registered
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.85rem',
              backgroundColor: 'var(--surface, #ffffff)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid rgba(187, 247, 208, 0.7)',
              marginBottom: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Patient ID:</span>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--status-completed, #16a34a)' }}>
                #{createdPatient.patientId}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Full Name:</span>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
                {createdPatient.patientName}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Age / Gender:</span>
              <p style={{ fontSize: '13.5px', color: 'var(--text-main, #172033)' }}>
                {createdPatient.age} yrs &bull; {createdPatient.gender}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Phone Number:</span>
              <p style={{ fontSize: '13.5px', fontFamily: 'ui-monospace, monospace', color: 'var(--text-main, #172033)' }}>
                {createdPatient.phone}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={`/new-consultation?patientId=${createdPatient.patientId}`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={<QueueIcon size={16} />}>
                New Consultation
              </Button>
            </Link>
            <Button variant="outline" onClick={handleRegisterAnother} icon={<RegisterIcon size={16} />}>
              Register Another Patient
            </Button>
          </div>
        </div>
      )}

      <Card title="Patient Details">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--primary-subtle, #eff6ff)',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--primary-border, #bfdbfe)',
              fontSize: '13px',
              color: 'var(--primary, #2563eb)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <InfoIcon size={18} />
            <span>
              Patient ID is system-generated upon registration. There is no manual ID input.
            </span>
          </div>

          <Input
            label="Full Name"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="e.g. John Smith"
            required
            helperText="Enter the patient's legal name"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 34"
              required
              min="1"
              max="150"
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
              required
            />
          </div>

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-digit phone number (e.g. 9876543210)"
            required
            maxLength="10"
            helperText="Must be a unique 10-digit number"
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light, #f1f5f9)',
            }}
          >
            <Button
              variant="outline"
              type="button"
              onClick={() => setFormData({ patientName: '', age: '', gender: 'Male', phone: '' })}
              disabled={loading}
            >
              Clear
            </Button>
            <Button variant="primary" type="submit" loading={loading} disabled={loading}>
              {loading ? 'Registering...' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
