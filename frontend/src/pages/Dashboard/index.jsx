import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, statusRes] = await Promise.all([
        api.getDashboardStats().catch((err) => {
          console.warn('Dashboard stats error:', err);
          return null;
        }),
        api.getStatus().catch((err) => {
          console.warn('Status error:', err);
          return null;
        }),
      ]);

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      if (statusRes && statusRes.data) {
        setStatus(statusRes.data);
      }

      if (!statsRes && !statusRes) {
        throw new Error('Unable to connect to C++ backend. Ensure hospital_queue_backend is running.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch live operational telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, []);

  const totalWaiting = stats?.totalWaiting ?? status?.waitingConsultations ?? 0;
  const emergencyWaiting = stats?.emergencyWaiting ?? 0;
  const normalWaiting = stats?.normalWaiting ?? 0;
  const inConsultation = stats?.inConsultation ?? stats?.inConsultationCount ?? 0;
  const doctorCount = stats?.doctorCount ?? status?.activeDoctors ?? 0;
  const patientCount = stats?.patientCount ?? status?.totalPatients ?? 0;
  const completedCount = stats?.completedConsultations ?? status?.completedConsultations ?? 0;
  const cancelledCount = stats?.cancelledConsultations ?? status?.cancelledConsultations ?? 0;
  const nextTokenStr = stats?.formattedNextToken ?? status?.formattedNextToken ?? '001';

  const isDbConnected = status?.databaseConnected ?? false;
  const isBackendRunning = status?.backendStatus === 'running' || !!stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Operational Dashboard
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            Real-time hospital queue management &bull; Live C++ DSA queue telemetry
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={fetchDashboardData} loading={loading}>
            Refresh
          </Button>
          <Link to="/register-patient" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">+ Register Patient</Button>
          </Link>
          <Link to="/new-consultation" style={{ textDecoration: 'none' }}>
            <Button variant="primary">+ New Consultation</Button>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} retryAction={fetchDashboardData} />}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                Total Waiting
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem' }}>
                {loading && !stats ? '...' : totalWaiting}
              </h3>
            </div>
            <Badge variant="waiting">Queue</Badge>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Active in-memory queues</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase' }}>
                Emergency Waiting
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#dc2626', marginTop: '0.25rem' }}>
                {loading && !stats ? '...' : emergencyWaiting}
              </h3>
            </div>
            <Badge variant="emergency">Priority</Badge>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Bypasses normal queue</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>
                Normal Waiting
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#0284c7', marginTop: '0.25rem' }}>
                {loading && !stats ? '...' : normalWaiting}
              </h3>
            </div>
            <Badge variant="normal">FIFO</Badge>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Processed FIFO order</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: '700', textTransform: 'uppercase' }}>
                In Consultation
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#7c3aed', marginTop: '0.25rem' }}>
                {loading && !stats ? '...' : inConsultation}
              </h3>
            </div>
            <Badge variant="inConsultation">Active</Badge>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Currently with doctors</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>
                Active Doctors
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#16a34a', marginTop: '0.25rem' }}>
                {loading && !stats ? '...' : doctorCount}
              </h3>
            </div>
            <Badge variant="completed">Rooms</Badge>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Available for consultations</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: '700', textTransform: 'uppercase' }}>
                Next Token
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#4f46e5', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {loading && !stats ? '...' : nextTokenStr}
              </h3>
            </div>
            <Badge variant="info">Sequence</Badge>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Sequential token sequence</p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Registered Patients:</span>
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>
            {patientCount}
          </p>
        </div>
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Completed Consultations:</span>
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16a34a', marginTop: '0.2rem' }}>
            {completedCount}
          </p>
        </div>
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cancelled Consultations:</span>
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#64748b', marginTop: '0.2rem' }}>
            {cancelledCount}
          </p>
        </div>
      </div>

      {/* Per-Doctor Queue Load Summary */}
      <Card
        title="Doctor Queue Summary"
        subtitle="Current live load distribution across consulting rooms"
        actions={
          <Link to="/doctor-queues" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">Inspect Queues</Button>
          </Link>
        }
      >
        {loading && !stats ? (
          <LoadingState message="Loading live doctor queues..." />
        ) : stats && stats.doctorQueueSummary && stats.doctorQueueSummary.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {stats.doctorQueueSummary.map((doc) => (
              <div
                key={doc.doctorId}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                      {doc.doctorName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>{doc.specialization}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#e2e8f0',
                      color: '#334155',
                    }}
                  >
                    Room {doc.roomNo}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span>Waiting: <strong style={{ color: '#0f172a' }}>{doc.totalWaiting}</strong></span>
                  {doc.emergencyWaiting > 0 && (
                    <Badge variant="emergency" size="sm">
                      {doc.emergencyWaiting} EMG
                    </Badge>
                  )}
                  {doc.normalWaiting > 0 && (
                    <Badge variant="normal" size="sm">
                      {doc.normalWaiting} Normal
                    </Badge>
                  )}
                </div>

                {doc.hasCurrentConsultation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#6b21a8', backgroundColor: '#faf5ff', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #e9d5ff' }}>
                    <span style={{ fontWeight: '700' }}>In Room:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>Token {doc.formattedCurrentToken}</span>
                    <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>({doc.currentPatientName})</span>
                  </div>
                )}

                {doc.hasNextPatient ? (
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>
                    Next to call:{' '}
                    <strong
                      style={{
                        fontFamily: 'monospace',
                        color: doc.isNextEmergency ? '#dc2626' : '#2563eb',
                      }}
                    >
                      Token {doc.formattedNextToken} {doc.isNextEmergency ? '(EMERGENCY)' : ''}
                    </strong>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.25rem' }}>
                    Queue empty
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Doctors Registered"
            description="No consulting rooms or doctors are currently configured."
            icon="👨‍⚕️"
            actionButton={
              <Link to="/doctors">
                <Button variant="primary">Go to Doctors Directory</Button>
              </Link>
            }
          />
        )}
      </Card>

      {/* Backend & Persistence System Telemetry */}
      <Card title="C++ Core & Persistence Status">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>C++ REST API Server</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isBackendRunning ? '#16a34a' : '#dc2626',
                }}
              />
              <strong style={{ color: isBackendRunning ? '#16a34a' : '#dc2626' }}>
                {isBackendRunning ? 'Online (HTTP/REST JSON)' : 'Disconnected'}
              </strong>
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>MongoDB Database</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isDbConnected ? '#16a34a' : '#dc2626',
                }}
              />
              <strong style={{ color: isDbConnected ? '#16a34a' : '#dc2626' }}>
                {isDbConnected ? 'Connected (Persistent)' : 'Disconnected / In-Memory'}
              </strong>
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>In-Memory Queue Engine</span>
            <div style={{ marginTop: '0.25rem' }}>
              <strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>
                Array-Based Circular Queue (FIFO)
              </strong>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
