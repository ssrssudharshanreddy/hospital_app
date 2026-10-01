import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConsultationStatusBadge from '../../components/consultations/ConsultationStatusBadge';
import {
  RefreshIcon,
  RegisterIcon,
  QueueIcon,
  SearchIcon,
  PulseIcon,
  DoctorIcon,
  ClockIcon,
} from '../../components/common/Icons';
import api from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, inConsultationRes, recentRes] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getConsultations({ status: 'In Consultation' }).catch(() => null),
        api.getConsultations().catch(() => null),
      ]);

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      if (inConsultationRes && inConsultationRes.data && inConsultationRes.data.consultations) {
        setActiveConsultations(inConsultationRes.data.consultations);
      } else {
        setActiveConsultations([]);
      }
      if (recentRes && recentRes.data && recentRes.data.consultations) {
        const sorted = [...recentRes.data.consultations].reverse().slice(0, 6);
        setRecentConsultations(sorted);
      } else {
        setRecentConsultations([]);
      }

      if (!statsRes && !recentRes) {
        throw new Error('Unable to connect to hospital queue backend. Ensure backend is running.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch operational data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalWaiting = stats?.totalWaiting ?? 0;
  const emergencyWaiting = stats?.emergencyWaiting ?? 0;
  const inConsultation = stats?.inConsultation ?? activeConsultations.length;
  const doctorCount = stats?.doctorCount ?? 0;
  const doctorQueueSummary = stats?.doctorQueueSummary ?? [];

  const doctorColumns = [
    {
      header: 'Doctor',
      key: 'doctorName',
      render: (d) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--text-main, #172033)' }}>{d.doctorName}</div>
          <div style={{ fontSize: '12px', color: 'var(--primary, #2563eb)' }}>{d.specialization}</div>
        </div>
      ),
    },
    {
      header: 'Room',
      key: 'roomNo',
      width: '100px',
      render: (d) => (
        <span style={{ fontWeight: '500', color: 'var(--text-secondary, #667085)' }}>
          Room {d.roomNo}
        </span>
      ),
    },
    {
      header: 'Emergency Waiting',
      key: 'emergencyWaiting',
      width: '150px',
      render: (d) => (
        d.emergencyWaiting > 0 ? (
          <Badge variant="emergency" size="sm">{d.emergencyWaiting} patients</Badge>
        ) : (
          <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12.5px' }}>0</span>
        )
      ),
    },
    {
      header: 'Normal Waiting',
      key: 'normalWaiting',
      width: '140px',
      render: (d) => (
        d.normalWaiting > 0 ? (
          <Badge variant="normal" size="sm">{d.normalWaiting} patients</Badge>
        ) : (
          <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12.5px' }}>0</span>
        )
      ),
    },
    {
      header: 'Total Waiting',
      key: 'totalWaiting',
      width: '120px',
      render: (d) => (
        <span style={{ fontWeight: '700', color: d.totalWaiting > 0 ? 'var(--text-main, #172033)' : 'var(--text-secondary, #667085)' }}>
          {d.totalWaiting}
        </span>
      ),
    },
    {
      header: 'Currently Consulting',
      key: 'currentlyConsulting',
      render: (d) => (
        d.hasCurrentConsultation ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '12px',
                fontWeight: '700',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-xs, 4px)',
                backgroundColor: 'var(--status-consulting-bg, #eef2ff)',
                color: 'var(--status-consulting-text, #3730a3)',
                border: '1px solid var(--status-consulting-border, #c7d2fe)',
              }}
            >
              Token {d.formattedCurrentToken}
            </span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-main, #172033)', fontWeight: '500' }}>
              {d.currentPatientName}
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-secondary, #667085)', fontSize: '12.5px', fontStyle: 'italic' }}>
            Available
          </span>
        )
      ),
    },
    {
      header: 'Action',
      key: 'action',
      width: '110px',
      align: 'right',
      render: (d) => (
        <Link to={`/doctor-queues?doctorId=${d.doctorId}`} style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="sm">View Queue</Button>
        </Link>
      ),
    },
  ];

  const recentColumns = [
    {
      header: 'Token',
      key: 'tokenNo',
      width: '90px',
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
        <div style={{ fontWeight: '500', color: 'var(--text-main, #172033)' }}>{c.doctorName}</div>
      ),
    },
    {
      header: 'Room',
      key: 'roomNo',
      width: '90px',
      render: (c) => (
        <span style={{ color: 'var(--text-secondary, #667085)' }}>Room {c.roomNo}</span>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      width: '110px',
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
      header: 'Time',
      key: 'createdAt',
      width: '130px',
      render: (c) => (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>
          {c.createdAt || '—'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--surface, #ffffff)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border, #e4e7ec)',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
            Dashboard
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
            Overview of today's patient flow
          </p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData} loading={loading} icon={<RefreshIcon size={16} />}>
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} retryAction={fetchDashboardData} />}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <Card style={{ borderLeft: '4px solid var(--status-waiting, #d97706)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Patients Waiting
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main, #172033)', marginTop: '0.35rem', lineHeight: 1 }}>
                {loading && !stats ? '...' : totalWaiting}
              </h3>
            </div>
            <Badge variant="waiting" size="sm">Queue</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', marginTop: '0.5rem' }}>Waiting across all rooms</p>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--status-emergency, #dc2626)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--status-emergency-text, #991b1b)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Emergency Patients
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--status-emergency, #dc2626)', marginTop: '0.35rem', lineHeight: 1 }}>
                {loading && !stats ? '...' : emergencyWaiting}
              </h3>
            </div>
            <Badge variant="emergency" size="sm">Priority</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', marginTop: '0.5rem' }}>Priority queue patients</p>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--status-consulting, #4f46e5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--status-consulting-text, #3730a3)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                In Consultation
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--status-consulting, #4f46e5)', marginTop: '0.35rem', lineHeight: 1 }}>
                {loading && !stats ? '...' : inConsultation}
              </h3>
            </div>
            <Badge variant="inConsultation" size="sm">Examining</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', marginTop: '0.5rem' }}>Currently with doctors</p>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--status-completed, #16a34a)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--status-completed-text, #166534)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Doctors
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--status-completed, #16a34a)', marginTop: '0.35rem', lineHeight: 1 }}>
                {loading && !stats ? '...' : doctorCount}
              </h3>
            </div>
            <Badge variant="completed" size="sm">Available</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', marginTop: '0.5rem' }}>Consulting rooms staffed</p>
        </Card>
      </div>

      <Card
        title="CURRENTLY IN CONSULTATION"
        subtitle="Patients currently inside examination rooms with attending doctors"
      >
        {loading && activeConsultations.length === 0 ? (
          <LoadingState message="Checking active consultations..." minHeight="120px" />
        ) : activeConsultations.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {activeConsultations.map((c) => (
              <div
                key={c.tokenNo}
                style={{
                  backgroundColor: 'var(--status-consulting-bg, #eef2ff)',
                  border: '1px solid var(--status-consulting-border, #c7d2fe)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '15px',
                      fontWeight: '700',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-xs, 4px)',
                      backgroundColor: 'var(--status-consulting, #4f46e5)',
                      color: '#ffffff',
                    }}
                  >
                    Token {c.formattedToken || String(c.tokenNo).padStart(3, '0')}
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <ConsultationStatusBadge status="In Consultation" size="sm" />
                    {c.emergency && <Badge variant="emergency" size="sm">EMG</Badge>}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>
                    {c.patientName}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
                    Patient #{c.patientId} &bull; Issue: {c.healthIssue || 'General consultation'}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid rgba(199, 210, 254, 0.6)',
                    fontSize: '12.5px',
                    color: 'var(--status-consulting-text, #3730a3)',
                  }}
                >
                  <span style={{ fontWeight: '600' }}>{c.doctorName}</span>
                  <span style={{ fontWeight: '500' }}>Room {c.roomNo}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary, #667085)', padding: '1.75rem 0', fontSize: '13.5px' }}>
            No patient currently inside consultation rooms. Doctors are ready to call waiting patients.
          </div>
        )}
      </Card>

      <Card
        title="DOCTOR QUEUE OVERVIEW"
        subtitle="Current live load distribution across consulting rooms"
        actions={
          <Link to="/doctor-queues" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">All Doctor Queues</Button>
          </Link>
        }
      >
        <Table
          columns={doctorColumns}
          data={doctorQueueSummary}
          emptyMessage="No doctors configured in system yet."
          keyExtractor={(d) => d.doctorId}
        />
      </Card>

      <div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary, #667085)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
          QUICK ACTIONS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <Link to="/register-patient" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e4e7ec)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast, 0.15s ease), box-shadow var(--transition-fast, 0.15s ease)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary, #2563eb)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border, #e4e7ec)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ color: 'var(--primary, #2563eb)', display: 'flex' }}>
                <RegisterIcon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>Register Patient</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Create new patient ID</p>
              </div>
            </div>
          </Link>

          <Link to="/new-consultation" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e4e7ec)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast, 0.15s ease), box-shadow var(--transition-fast, 0.15s ease)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary, #2563eb)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border, #e4e7ec)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ color: 'var(--primary, #2563eb)', display: 'flex' }}>
                <QueueIcon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>New Consultation</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Issue token & queue</p>
              </div>
            </div>
          </Link>

          <Link to="/search-patients" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e4e7ec)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast, 0.15s ease), box-shadow var(--transition-fast, 0.15s ease)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary, #2563eb)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border, #e4e7ec)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ color: 'var(--primary, #2563eb)', display: 'flex' }}>
                <SearchIcon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>Search Patient</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Lookup by phone or ID</p>
              </div>
            </div>
          </Link>

          <Link to="/doctor-queues" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e4e7ec)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast, 0.15s ease), box-shadow var(--transition-fast, 0.15s ease)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary, #2563eb)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border, #e4e7ec)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ color: 'var(--primary, #2563eb)', display: 'flex' }}>
                <DoctorIcon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>Doctor Queues</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>View active waitlists</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <Card
        title="RECENT CONSULTATIONS"
        subtitle="Recent patient visits across all hospital rooms"
        actions={
          <Link to="/consultations" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">View All Records</Button>
          </Link>
        }
      >
        <Table
          columns={recentColumns}
          data={recentConsultations}
          emptyMessage="No consultation records registered in the system yet."
          keyExtractor={(c) => c.tokenNo}
        />
      </Card>
    </div>
  );
}
