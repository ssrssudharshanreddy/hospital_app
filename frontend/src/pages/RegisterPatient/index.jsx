import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
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

    // Client-side validation mirroring C++ backend rules
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
      // Backend error handling: e.g. duplicate phone (409) or validation failure (400)
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
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
          Register New Patient
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          Create a permanent patient identity with automatic C++ sequential ID generation
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Prominent Success Display */}
      {createdPatient && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎉</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#166534' }}>
              Patient Registered Successfully
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.85rem',
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #dcfce7',
              marginBottom: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID:</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#16a34a' }}>
                #{createdPatient.patientId}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient Name:</span>
              <p style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
                {createdPatient.patientName}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Age / Gender:</span>
              <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>
                {createdPatient.age} yrs &bull; {createdPatient.gender}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone:</span>
              <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>
                {createdPatient.phone}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={`/new-consultation?patientId=${createdPatient.patientId}`} style={{ textDecoration: 'none' }}>
              <Button variant="primary">
                + Book Consultation for This Patient
              </Button>
            </Link>
            <Button variant="outline" onClick={handleRegisterAnother}>
              Register Another Patient
            </Button>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <Card title="Patient Details">
        <form onSubmit={handleSubmit}>
          {/* Rule Notification */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
              fontSize: '0.825rem',
              color: '#1e40af',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>ℹ️</span>
            <span>
              <strong>Note:</strong> Patient ID is generated automatically by C++ upon creation. There is no manual ID input.
            </span>
          </div>

          <Input
            label="Patient Name"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            required
            helperText="Enter the patient's full legal name"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 29"
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
            placeholder="10-digit mobile number (e.g. 9876543210)"
            required
            maxLength="10"
            helperText="Must be a unique 10-digit phone number"
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
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
            <Button variant="primary" type="submit" loading={loading}>
              Register Patient
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
