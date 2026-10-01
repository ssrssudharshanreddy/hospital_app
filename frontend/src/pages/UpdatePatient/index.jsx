import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingState from '../../components/common/LoadingState';
import { SearchIcon, InfoIcon } from '../../components/common/Icons';
import api from '../../services/api';

export default function UpdatePatientPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryPatientId = searchParams.get('patientId') || '';

  const [lookupId, setLookupId] = useState(queryPatientId);
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (queryPatientId) {
      handleLookup(queryPatientId);
    }
  }, [queryPatientId]);

  const handleLookup = async (idToSearch) => {
    const id = idToSearch || lookupId;
    if (!id) {
      setError('Please enter a Patient ID to find.');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.getPatientById(parseInt(id, 10));
      if (res && res.data) {
        setPatient(res.data);
        setFormData({
          patientName: res.data.patientName,
          age: String(res.data.age),
          gender: res.data.gender,
          phone: res.data.phone,
        });
      }
    } catch (err) {
      setPatient(null);
      setError(err.message || `Patient ID #${id} not found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!patient) return;
    setError(null);
    setSuccess(null);

    const ageNum = parseInt(formData.age, 10);
    if (!formData.patientName.trim()) {
      setError('Patient Name is required.');
      return;
    }
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      setError('Age must be between 1 and 150.');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setUpdating(true);
    try {
      const res = await api.updatePatient(patient.patientId, {
        patientName: formData.patientName.trim(),
        age: ageNum,
        gender: formData.gender,
        phone: formData.phone.trim(),
      });

      if (res && res.data) {
        setPatient(res.data);
        setSuccess(`Patient #${res.data.patientId} demographics updated successfully.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update patient information.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
          Update Patient
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
          Modify patient demographics while preserving permanent Patient ID
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      <Card title="Find Patient Record">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Patient ID"
              name="lookupId"
              type="number"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Enter Patient ID (e.g. 101)"
              style={{ marginBottom: 0 }}
            />
          </div>
          <Button variant="primary" onClick={() => handleLookup()} loading={loading} icon={<SearchIcon size={16} />}>
            Find Record
          </Button>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Fetching patient record..." />
      ) : patient ? (
        <Card title={`Editing Patient #${patient.patientId}: ${patient.patientName}`}>
          <form onSubmit={handleUpdate}>
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
                <strong>Patient ID #{patient.patientId} is permanent and read-only.</strong> Demographics can be edited below.
              </span>
            </div>

            <Input
              label="Patient ID"
              value={`#${patient.patientId}`}
              readOnly
              disabled
              helperText="Permanent identifier assigned at registration"
            />

            <Input
              label="Full Name"
              name="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                min="1"
                max="150"
              />

              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              maxLength="10"
              helperText="10-digit mobile number"
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
                onClick={() => navigate('/patients')}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={updating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
