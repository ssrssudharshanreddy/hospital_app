import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConsultationStatusBadge from '../../components/consultations/ConsultationStatusBadge';
import {
  RegisterIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  QueueIcon,
  RefreshIcon,
} from '../../components/common/Icons';
import api from '../../services/api';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPatients();
      if (res && res.data && res.data.patients) {
        setPatients(res.data.patients);
      } else {
        setPatients([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch registered patients list.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    try {
      const res = await api.getConsultations({ patientId: patient.patientId });
      if (res && res.data && res.data.consultations) {
        setPatientHistory(res.data.consultations);
      } else {
        setPatientHistory([]);
      }
    } catch (err) {
      setPatientHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = p.patientName?.toLowerCase().includes(q);
    const phoneMatch = p.phone?.includes(q);
    const idMatch = String(p.patientId) === q || String(p.patientId).includes(q);
    return nameMatch || phoneMatch || idMatch;
  });

  const columns = [
    {
      header: 'Patient ID',
      key: 'patientId',
      width: '120px',
      render: (p) => (
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '13px',
            fontWeight: '700',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-xs, 4px)',
            backgroundColor: 'var(--primary-subtle, #eff6ff)',
            color: 'var(--primary, #2563eb)',
            border: '1px solid var(--primary-border, #bfdbfe)',
          }}
        >
          #{p.patientId}
        </span>
      ),
    },
    {
      header: 'Full Name',
      key: 'patientName',
      render: (p) => (
        <span style={{ fontWeight: '600', color: 'var(--text-main, #172033)' }}>
          {p.patientName}
        </span>
      ),
    },
    {
      header: 'Age',
      key: 'age',
      width: '90px',
      render: (p) => (
        <span style={{ color: 'var(--text-secondary, #667085)' }}>{p.age} yrs</span>
      ),
    },
    {
      header: 'Gender',
      key: 'gender',
      width: '100px',
      render: (p) => (
        <span style={{ color: 'var(--text-secondary, #667085)' }}>{p.gender}</span>
      ),
    },
    {
      header: 'Phone Number',
      key: 'phone',
      width: '140px',
      render: (p) => (
        <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', color: 'var(--text-main, #172033)' }}>
          {p.phone}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '240px',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPatientDetails(p)}
            icon={<EyeIcon size={14} />}
          >
            View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/update-patient?patientId=${p.patientId}`)}
            icon={<EditIcon size={14} />}
          >
            Edit
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/new-consultation?patientId=${p.patientId}`)}
            icon={<QueueIcon size={14} />}
          >
            Consult
          </Button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    {
      header: 'Token',
      key: 'tokenNo',
      width: '85px',
      render: (h) => (
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '12px',
            fontWeight: '700',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-xs, 4px)',
            backgroundColor: h.emergency ? 'var(--status-emergency-bg, #fee2e2)' : 'var(--primary-subtle, #eff6ff)',
            color: h.emergency ? 'var(--status-emergency-text, #991b1b)' : 'var(--primary, #2563eb)',
          }}
        >
          {h.formattedToken || String(h.tokenNo).padStart(3, '0')}
        </span>
      ),
    },
    {
      header: 'Doctor',
      key: 'doctorName',
      render: (h) => (
        <div>
          <div style={{ fontWeight: '500', color: 'var(--text-main, #172033)' }}>{h.doctorName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #667085)' }}>Room {h.roomNo}</div>
        </div>
      ),
    },
    {
      header: 'Health Issue',
      key: 'healthIssue',
      render: (h) => (
        <span style={{ fontSize: '12.5px', color: 'var(--text-main, #172033)' }}>
          {h.healthIssue || 'General consultation'}
        </span>
      ),
    },
    {
      header: 'Priority',
      key: 'emergency',
      width: '100px',
      render: (h) => (
        <Badge variant={h.emergency ? 'emergency' : 'normal'} size="sm">
          {h.emergency ? 'Emergency' : 'Normal'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      width: '130px',
      render: (h) => <ConsultationStatusBadge status={h.status} size="sm" />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: 'var(--surface, #ffffff)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border, #e4e7ec)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
            Patients
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
            Registered patients directory
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={fetchPatients} loading={loading} icon={<RefreshIcon size={16} />}>
            Refresh
          </Button>
          <Link to="/register-patient" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={<RegisterIcon size={16} />}>
              + Register Patient
            </Button>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} retryAction={fetchPatients} />}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--surface, #ffffff)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border, #e4e7ec)',
        }}
      >
        <span style={{ color: 'var(--text-secondary, #667085)', display: 'flex' }}>
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient name, phone or patient ID..."
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: 'var(--text-main, #172033)',
            width: '100%',
            backgroundColor: 'transparent',
          }}
        />
        {searchQuery && (
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <LoadingState message="Loading registered patients..." />
        ) : (
          <Table
            columns={columns}
            data={filteredPatients}
            emptyMessage={
              searchQuery
                ? `No patients found matching "${searchQuery}".`
                : 'No patients registered in the hospital database yet.'
            }
            keyExtractor={(p) => p.patientId}
          />
        )}
      </Card>

      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient ? `Patient Details: ${selectedPatient.patientName}` : 'Patient Details'}
        maxWidth="680px"
        footer={
          selectedPatient && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="outline"
                onClick={() => {
                  const pid = selectedPatient.patientId;
                  setSelectedPatient(null);
                  navigate(`/update-patient?patientId=${pid}`);
                }}
              >
                Edit Patient
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const pid = selectedPatient.patientId;
                  setSelectedPatient(null);
                  navigate(`/new-consultation?patientId=${pid}`);
                }}
              >
                + New Consultation
              </Button>
            </div>
          )
        }
      >
        {selectedPatient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                backgroundColor: 'var(--surface-alt, #f8fafc)',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border, #e4e7ec)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary, #667085)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                Permanent Patient Record
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Patient ID</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary, #2563eb)' }}>#{selectedPatient.patientId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Full Name</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #172033)' }}>{selectedPatient.patientName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Age / Gender</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-main, #172033)' }}>{selectedPatient.age} yrs &bull; {selectedPatient.gender}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)' }}>Phone Number</div>
                  <div style={{ fontSize: '14px', fontFamily: 'ui-monospace, monospace', color: 'var(--text-main, #172033)' }}>{selectedPatient.phone}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main, #172033)', marginBottom: '0.65rem' }}>
                Consultation History
              </div>
              {historyLoading ? (
                <LoadingState message="Loading consultation history..." minHeight="100px" />
              ) : patientHistory.length > 0 ? (
                <Table
                  columns={historyColumns}
                  data={patientHistory}
                  keyExtractor={(h) => h.tokenNo}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary, #667085)', fontSize: '13px', backgroundColor: 'var(--surface-alt, #f8fafc)', borderRadius: 'var(--radius-sm, 6px)', border: '1px dashed var(--border, #e4e7ec)' }}>
                  No previous consultation records found for this patient.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
