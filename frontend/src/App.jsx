import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Page Components
import DashboardPage from './pages/Dashboard';
import RegisterPatientPage from './pages/RegisterPatient';
import SearchPatientsPage from './pages/SearchPatients';
import NewConsultationPage from './pages/NewConsultation';
import ConsultationRecordsPage from './pages/ConsultationRecords';
import DoctorQueuesPage from './pages/DoctorQueues';
import ProcessPatientPage from './pages/ProcessPatient';
import DoctorsPage from './pages/Doctors';
import UpdatePatientPage from './pages/UpdatePatient';
import CancelConsultationPage from './pages/CancelConsultation';
import NotFoundPage from './pages/NotFound';

import api from './services/api';

export default function App() {
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.getHealth();
        setBackendConnected(true);
      } catch (err) {
        setBackendConnected(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Layout backendConnected={backendConnected}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/register-patient" element={<RegisterPatientPage />} />
          <Route path="/search-patients" element={<SearchPatientsPage />} />
          <Route path="/new-consultation" element={<NewConsultationPage />} />
          <Route path="/consultations" element={<ConsultationRecordsPage />} />
          <Route path="/doctor-queues" element={<DoctorQueuesPage />} />
          <Route path="/process-patient" element={<ProcessPatientPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/update-patient" element={<UpdatePatientPage />} />
          <Route path="/cancel-consultation" element={<CancelConsultationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
