import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PatientCard from '../../components/patients/PatientCard';
import PatientDetails from '../../components/patients/PatientDetails';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingState from '../../components/common/LoadingState';
import api from '../../services/api';

export default function SearchPatientsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('phone'); // 'phone' or 'id'
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setError('Please enter a phone number or Patient ID to search.');
      return;
    }

    if (searchType === 'phone') {
      if (!/^\d{10}$/.test(query)) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }
    } else {
      const idNum = parseInt(query, 10);
      if (isNaN(idNum) || idNum <= 0) {
        setError('Please enter a valid numerical Patient ID (e.g. 101).');
        return;
      }
    }

    setError(null);
    setLoading(true);
    setSearched(true);

    try {
      let res;
      if (searchType === 'phone') {
        res = await api.getPatientByPhone(query);
      } else {
        res = await api.getPatientById(parseInt(query, 10));
      }

      if (res && res.data) {
        setPatient(res.data);
      } else {
        setPatient(null);
      }
    } catch (err) {
      setPatient(null);
      // User-friendly error message
      if (err.status === 404 || err.message.includes('not found')) {
        setError(`No patient found matching ${searchType === 'phone' ? 'phone' : 'ID'} "${query}".`);
      } else {
        setError(err.message || 'Error occurred while contacting C++ backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setPatient(null);
    setError(null);
    setSearched(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
          Search Patients
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          Lookup existing records by 10-digit phone number or permanent Patient ID
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: searchType === 'phone' ? '600' : '400' }}>
                <input
                  type="radio"
                  name="searchType"
                  value="phone"
                  checked={searchType === 'phone'}
                  onChange={() => {
                    setSearchType('phone');
                    setPatient(null);
                    setError(null);
                  }}
                />
                Search by Phone Number
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: searchType === 'id' ? '600' : '400' }}>
                <input
                  type="radio"
                  name="searchType"
                  value="id"
                  checked={searchType === 'id'}
                  onChange={() => {
                    setSearchType('id');
                    setPatient(null);
                    setError(null);
                  }}
                />
                Search by Patient ID
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  name="query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchType === 'phone'
                      ? 'Enter 10-digit phone number (e.g. 9876543210)'
                      : 'Enter Patient ID (e.g. 101)'
                  }
                  style={{ marginBottom: 0 }}
                />
              </div>

              <Button variant="primary" type="submit" loading={loading}>
                Search Record
              </Button>
              {searched && (
                <Button variant="outline" type="button" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingState message="Searching records in C++ core..." />
      ) : patient ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
            Verified Patient Record
          </h3>

          <PatientDetails patient={patient} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              backgroundColor: '#ffffff',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <Button
              variant="outline"
              onClick={() => navigate(`/update-patient?patientId=${patient.patientId}`)}
            >
              Update Demographics
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/new-consultation?patientId=${patient.patientId}`)}
            >
              + Book New Consultation
            </Button>
          </div>
        </div>
      ) : searched && !loading ? (
        <EmptyState
          title="Patient Not Found"
          description={`No patient registered in the system with ${searchType === 'phone' ? 'phone number' : 'ID'} "${searchQuery}".`}
          icon="🔍"
          actionButton={
            <Button variant="secondary" onClick={() => navigate('/register-patient')}>
              Register As New Patient
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
