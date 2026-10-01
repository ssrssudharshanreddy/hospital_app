import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import ConsultationStatusBadge from '../../components/consultations/ConsultationStatusBadge';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { RefreshIcon, SearchIcon, FilterIcon } from '../../components/common/Icons';
import api from '../../services/api';

export default function ConsultationRecordsPage() {
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message || 'Failed to load consultation records.');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [statusFilter, doctorFilter]);

  const filteredConsultations = consultations.filter((c) => {
    if (priorityFilter === 'emergency' && !c.emergency) return false;
    if (priorityFilter === 'normal' && c.emergency) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const patientMatch = c.patientName?.toLowerCase().includes(q);
      const tokenMatch = String(c.tokenNo) === q || String(c.tokenNo).includes(q) || c.formattedToken?.toLowerCase().includes(q);
      const idMatch = String(c.patientId) === q;
      const issueMatch = c.healthIssue?.toLowerCase().includes(q);
      return patientMatch || tokenMatch || idMatch || issueMatch;
    }
    return true;
  });

  const columns = [
    {
      header: 'Token',
      key: 'tokenNo',
      width: '95px',
      render: (c) => (
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontWeight: '700',
            fontSize: '13px',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-xs, 4px)',
            backgroundColor: c.emergency ? 'var(--status-emergency-bg, #fee2e2)' : 'var(--primary-subtle, #eff6ff)',
            color: c.emergency ? 'var(--status-emergency-text, #991b1b)' : 'var(--primary, #2563eb)',
            border: `1px solid ${c.emergency ? 'var(--status-emergency-border, #fecaca)' : 'var(--primary-border, #bfdbfe)'}`,
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
          <div style={{ fontWeight: '600', color: 'var(--text-main, #172033)' }}>{c.patientName}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary, #667085)' }}>Patient #{c.patientId}</div>
        </div>
      ),
    },
    {
      header: 'Doctor',
      key: 'doctorName',
      render: (c) => (
        <span style={{ fontWeight: '500', color: 'var(--text-main, #172033)' }}>{c.doctorName}</span>
      ),
    },
    {
      header: 'Room',
      key: 'roomNo',
      width: '85px',
      render: (c) => (
        <span style={{ color: 'var(--text-secondary, #667085)' }}>Room {c.roomNo}</span>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      width: '100px',
      render: (c) => (
        <Badge variant={c.emergency ? 'emergency' : 'normal'} size="sm">
          {c.emergency ? 'Emergency' : 'Normal'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      width: '140px',
      render: (c) => <ConsultationStatusBadge status={c.status} size="sm" />,
    },
    {
      header: 'Date / Time',
      key: 'createdAt',
      width: '150px',
      render: (c) => (
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary, #667085)' }}>
          {c.createdAt || '—'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
            Consultation Records
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
            Operational history and live tracking of consultations
          </p>
        </div>

        <Button variant="outline" onClick={fetchConsultations} loading={loading} icon={<RefreshIcon size={16} />}>
          Refresh Records
        </Button>
      </div>

      {error && <ErrorMessage message={error} retryAction={fetchConsultations} />}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          backgroundColor: 'var(--surface, #ffffff)',
          padding: '1rem',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border, #e4e7ec)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--surface-alt, #f8fafc)',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #e4e7ec)',
              flex: 1,
              minWidth: '220px',
            }}
          >
            <SearchIcon size={16} color="var(--text-secondary, #667085)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, token, or patient ID..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13.5px',
                color: 'var(--text-main, #172033)',
                width: '100%',
                backgroundColor: 'transparent',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #667085)', whiteSpace: 'nowrap' }}>
              Doctor:
            </span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e4e7ec)',
                fontSize: '13px',
                backgroundColor: 'var(--surface, #ffffff)',
                color: 'var(--text-main, #172033)',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #667085)', whiteSpace: 'nowrap' }}>
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e4e7ec)',
                fontSize: '13px',
                backgroundColor: 'var(--surface, #ffffff)',
                color: 'var(--text-main, #172033)',
                outline: 'none',
              }}
            >
              <option value="">All Priorities</option>
              <option value="emergency">Emergency</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          {[
            { label: 'All', value: '' },
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
                  padding: '0.35rem 0.75rem',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--primary, #2563eb)' : 'var(--border, #e4e7ec)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '400',
                  backgroundColor: isActive ? 'var(--primary-subtle, #eff6ff)' : 'var(--surface, #ffffff)',
                  color: isActive ? 'var(--primary, #2563eb)' : 'var(--text-secondary, #667085)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast, 0.15s ease)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingState message="Loading consultation records..." />
        ) : (
          <Table
            columns={columns}
            data={filteredConsultations}
            emptyMessage={
              statusFilter || doctorFilter || priorityFilter || searchQuery
                ? 'No consultations found matching active filter criteria.'
                : 'No consultation records registered in the system yet.'
            }
            keyExtractor={(c) => c.tokenNo}
          />
        )}
      </Card>
    </div>
  );
}
