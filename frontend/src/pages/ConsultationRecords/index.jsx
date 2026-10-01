import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import ConsultationStatusBadge from '../../components/consultations/ConsultationStatusBadge';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';

export default function ConsultationRecordsPage() {
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch doctors for filter dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.getDoctors();
        if (res && res.data && res.data.doctors) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.warn('Could not load doctors list for filtering:', err);
      }
    };
    fetchDoctors();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (doctorFilter) params.doctorId = doctorFilter;

      const res = await api.getConsultations(params);
      if (res && res.data && res.data.consultations) {
        setConsultations(res.data.consultations);
      } else {
        setConsultations([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load consultation records from C++ backend.');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [statusFilter, doctorFilter]);

  const columns = [
    {
      header: 'Token',
      key: 'tokenNo',
      width: '100px',
      render: (c) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: c.emergency ? '#fef2f2' : '#eff6ff',
            color: c.emergency ? '#dc2626' : '#2563eb',
            border: `1px solid ${c.emergency ? '#fecaca' : '#bfdbfe'}`,
          }}
        >
          {c.formattedToken || String(c.tokenNo).padStart(3, '0')}
        </span>
      ),
    },
    {
      header: 'Patient',
      key: 'patientName',
      render: (c) => (
        <div>
          <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.patientName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID: #{c.patientId}</div>
        </div>
      ),
    },
    {
      header: 'Attending Doctor & Room',
      key: 'doctorName',
      render: (c) => (
        <div>
          <div style={{ fontWeight: '600', color: '#1e293b' }}>{c.doctorName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Room {c.roomNo}</div>
        </div>
      ),
    },
    {
      header: 'Chief Health Issue',
      key: 'healthIssue',
      render: (c) => (
        <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.healthIssue}
        </div>
      ),
    },
    {
      header: 'Status & Priority',
      key: 'status',
      width: '180px',
      render: (c) => <ConsultationStatusBadge status={c.status} emergency={c.emergency} />,
    },
    {
      header: 'Registered At',
      key: 'createdAt',
      width: '160px',
      render: (c) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {c.createdAt || '—'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Consultation Records
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            Persistent operational history of all consultation encounters across hospital rooms
          </p>
        </div>

        <Button variant="outline" onClick={fetchConsultations} loading={loading}>
          Refresh Records
        </Button>
      </div>

      {error && <ErrorMessage message={error} retryAction={fetchConsultations} />}

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { label: 'All Records', value: '' },
            { label: 'Waiting', value: 'Waiting' },
            { label: 'In Consultation', value: 'In Consultation' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  padding: '0.4rem 0.85rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? '700' : '500',
                  backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Doctor Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
            Filter by Doctor:
          </label>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.doctorId} value={d.doctorId}>
                {d.doctorName} (Room {d.roomNo})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingState message="Fetching live records from C++ API and MongoDB..." />
        ) : (
          <Table
            columns={columns}
            data={consultations}
            emptyMessage={
              statusFilter || doctorFilter
                ? 'No consultations found matching active filter criteria.'
                : 'No consultation records registered in the system yet.'
            }
          />
        )}
      </Card>
    </div>
  );
}
