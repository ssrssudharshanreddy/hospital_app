import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DoctorCard from '../../components/doctors/DoctorCard';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingState from '../../components/common/LoadingState';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import { PlusIcon, RefreshIcon, QueueIcon, InfoIcon } from '../../components/common/Icons';
import api from '../../services/api';

const computeNextDoctorId = (list) => {
  if (!list || list.length === 0) return 201;
  const ids = list
    .map((d) => Number(d.doctorId))
    .filter((n) => !isNaN(n) && n > 0);
  if (ids.length === 0) return 201;
  const maxId = Math.max(...ids);
  return Math.max(201, maxId + 1);
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    doctorId: '',
    doctorName: '',
    specialization: '',
    roomNo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctorsAndStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [docRes, statsRes] = await Promise.all([
        api.getDoctors(),
        api.getDashboardStats().catch(() => null),
      ]);

      if (docRes && docRes.data && docRes.data.doctors) {
        setDoctors(docRes.data.doctors);
      }
      if (statsRes && statsRes.data) {
        setDashboardStats(statsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsAndStats();
  }, []);

  const handleOpenAddModal = () => {
    const nextId = computeNextDoctorId(doctors);
    setNewDoctor({
      doctorId: nextId,
      doctorName: '',
      specialization: '',
      roomNo: '',
    });
    setError(null);
    setShowAddModal(true);
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const docId = Number(newDoctor.doctorId) || computeNextDoctorId(doctors);
    const room = parseInt(newDoctor.roomNo, 10);

    if (isNaN(docId) || docId <= 0) {
      setError('Doctor ID generation error.');
      return;
    }
    if (!newDoctor.doctorName.trim()) {
      setError('Doctor Name is required.');
      return;
    }
    if (!newDoctor.specialization.trim()) {
      setError('Specialization is required.');
      return;
    }
    if (isNaN(room) || room <= 0) {
      setError('Room number must be a positive integer.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addDoctor({
        doctorId: docId,
        doctorName: newDoctor.doctorName.trim(),
        specialization: newDoctor.specialization.trim(),
        roomNo: room,
      });

      if (res && res.success) {
        setSuccess(`Doctor ${newDoctor.doctorName} (#${docId}) registered successfully.`);
        setShowAddModal(false);
        setNewDoctor({ doctorId: '', doctorName: '', specialization: '', roomNo: '' });
        fetchDoctorsAndStats();
      }
    } catch (err) {
      setError(err.message || 'Failed to add doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSummaryForDoctor = (docId) => {
    if (!dashboardStats?.doctorQueueSummary) return null;
    return dashboardStats.doctorQueueSummary.find((s) => s.doctorId === docId);
  };

  const currentNextDoctorId = computeNextDoctorId(doctors);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main, #172033)', letterSpacing: '-0.02em' }}>
            Doctors Directory
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #667085)', marginTop: '0.15rem' }}>
            Attending physicians, specializations, rooms, and queue depths
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={fetchDoctorsAndStats} loading={loading} icon={<RefreshIcon size={16} />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal} icon={<PlusIcon size={16} />}>
            Add Doctor
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      {loading ? (
        <LoadingState message="Loading doctors directory..." />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem',
          }}
        >
          {doctors.map((doc) => (
            <DoctorCard
              key={doc.doctorId}
              doctor={doc}
              queueSummary={getSummaryForDoctor(doc.doctorId)}
              actions={
                <Link to={`/doctor-queues?doctorId=${doc.doctorId}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm" icon={<QueueIcon size={14} />}>
                    View Queue
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Doctor"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddDoctor} loading={submitting}>
              Add Doctor
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddDoctor}>
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
              Doctor ID is system-generated and assigned automatically.
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-main, #172033)',
                marginBottom: '0.35rem',
              }}
            >
              Doctor ID (System-Generated)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--surface-muted, #f8fafc)',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 'var(--radius-sm, 6px)',
              }}
            >
              <span
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--primary, #2563eb)',
                }}
              >
                #{newDoctor.doctorId || currentNextDoctorId}
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: '600',
                  color: 'var(--text-secondary, #667085)',
                  backgroundColor: 'var(--surface, #ffffff)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: '1px solid var(--border, #e2e8f0)',
                }}
              >
                Auto-assigned &amp; Unique
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #667085)', marginTop: '0.35rem' }}>
              Sequential unique ID assigned to the new practitioner
            </p>
          </div>

          <Input
            label="Doctor Name"
            name="doctorName"
            value={newDoctor.doctorName}
            onChange={(e) => setNewDoctor({ ...newDoctor, doctorName: e.target.value })}
            placeholder="e.g. Dr. Rajesh Verma"
            required
            helperText="Include professional title and legal full name"
          />

          <Input
            label="Specialization"
            name="specialization"
            value={newDoctor.specialization}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
            placeholder="e.g. General Medicine, Cardiology"
            required
            helperText="Clinical department or specialty area"
          />

          <Input
            label="Room Number"
            name="roomNo"
            type="number"
            value={newDoctor.roomNo}
            onChange={(e) => setNewDoctor({ ...newDoctor, roomNo: e.target.value })}
            placeholder="e.g. 204"
            required
            min="1"
            helperText="Designated consultation room"
          />
        </form>
      </Modal>
    </div>
  );
}
