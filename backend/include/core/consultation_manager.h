#ifndef CONSULTATION_MANAGER_H
#define CONSULTATION_MANAGER_H

#include "models/structures.h"
#include "core/queue_manager.h"
#include "core/patient_manager.h"
#include "core/doctor_manager.h"
#include "core/token_manager.h"
#include <unordered_map>
#include <vector>
#include <string>

// Forward declaration
class IDatabaseManager;

// ==============================================================
// ConsultationManager: Consultation Workflow & Registration
// Connects PatientManager, DoctorManager, TokenManager, QueueManager
// As specified in Document 1, 2, 4, 5 (Phase 4 & 5)
// ==============================================================

class ConsultationManager {
private:
    QueueManager& queueManager;
    PatientManager& patientManager;
    DoctorManager& doctorManager;
    TokenManager& tokenManager;
    IDatabaseManager* dbManager;

    // Key: tokenNo, Value: ConsultationRecord
    std::unordered_map<int, ConsultationRecord> consultationHistory;

public:
    ConsultationManager(QueueManager& qm, PatientManager& pm, DoctorManager& dm, TokenManager& tm);

    void setDatabaseManager(IDatabaseManager* db) { dbManager = db; }
    IDatabaseManager* getDatabaseManager() const { return dbManager; }

    // 1. Consultation Registration
    bool registerConsultation(int patientId, const std::string& healthIssue, int doctorId,
                              bool emergency, ConsultationRecord& outRecord, std::string& errorMsg);

    // 2. Active Consultation Detection (Duplicate Prevention)
    bool hasActiveWaitingConsultation(int patientId, int& outTokenNo, int& outDoctorId) const;

    // 3. Consultation Lookup & History
    bool findConsultationByToken(int tokenNo, ConsultationRecord& outRecord) const;
    std::vector<ConsultationRecord> getConsultationsByPatientId(int patientId) const;
    std::vector<ConsultationRecord> getConsultationsByDoctorId(int doctorId) const;
    std::vector<ConsultationRecord> getAllConsultations() const;

    // 4. Consultation Lifecycle: Processing, Completion, Cancellation
    bool processNextPatient(int doctorId, ConsultationRecord& outRecord, std::string& errorMsg);
    bool completeConsultation(int tokenNo, std::string& errorMsg);
    bool cancelConsultation(int tokenNo, std::string& errorMsg);

    // 5. Consultation Update
    bool updateConsultation(int tokenNo, int newDoctorId, bool newEmergency,
                            const std::string& newHealthIssue, std::string& errorMsg);

    // 6. Metrics & Counts
    int countWaitingConsultations() const;
    int countCompletedConsultations() const;
    int countCancelledConsultations() const;
    int countTotalConsultations() const;

    // 7. Testing & Persistence Utilities
    void clearAllConsultations();
    void loadConsultations(const std::vector<ConsultationRecord>& records);
};

#endif // CONSULTATION_MANAGER_H
