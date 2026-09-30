#include "core/system_recovery.h"
#include "utils/logger.h"
#include <algorithm>

bool SystemRecovery::recoverSystemState(IDatabaseManager& db,
                                      PatientManager& pm,
                                      DoctorManager& dm,
                                      TokenManager& tm,
                                      QueueManager& qm,
                                      ConsultationManager& cm,
                                      std::string& outSummary) {
    if (!db.isConnected() && !db.ping()) {
        outSummary = "MongoDB unavailable. Database recovery skipped; running in in-memory mode.";
        Logger::warn(outSummary);
        return false;
    }

    // 1. Patient Recovery:
    // Load existing patient records so Patient ID generator starts at highestId + 1.
    std::vector<Patient> dbPatients = db.getAllPatients();
    if (!dbPatients.empty()) {
        pm.loadPatients(dbPatients);
    }

    // 2. Doctor Recovery:
    // Load stored doctors. If no doctors exist in database, seed initial doctors and persist them.
    std::vector<Doctor> dbDoctors = db.getAllDoctors();
    if (!dbDoctors.empty()) {
        dm.loadDoctors(dbDoctors);
    } else {
        dm.seedInitialDoctors();
        for (const auto& d : dm.getAllDoctors()) {
            db.saveDoctor(d);
        }
    }

    // 3. Consultation & Token Recovery:
    // Load consultation records.
    // Determine highest token so cancelled and completed tokens are never reused on restart.
    std::vector<ConsultationRecord> allConsultations = db.getAllConsultations();
    if (!allConsultations.empty()) {
        cm.loadConsultations(allConsultations);

        int highestToken = 0;
        std::string today = tm.getCurrentDate();
        for (const auto& c : allConsultations) {
            if (c.tokenNo > highestToken) {
                highestToken = c.tokenNo;
            }
        }
        if (highestToken > 0) {
            tm.recoverSequence(highestToken, today);
        }
    }

    // 4. Active Queue Recovery:
    // Rebuild C++ active queues from MongoDB consultation records whose status is "Waiting".
    // Preserves original consultation arrival order (sort waiting by tokenNo ascending).
    std::vector<ConsultationRecord> waitingList = db.getWaitingConsultations();
    std::sort(waitingList.begin(), waitingList.end(), [](const ConsultationRecord& a, const ConsultationRecord& b) {
        return a.tokenNo < b.tokenNo;
    });

    qm.clearAllQueues();
    for (const auto& rec : waitingList) {
        QueueRegistration reg(rec.tokenNo, rec.patientId, rec.healthIssue, rec.doctorId, rec.emergency);
        if (rec.emergency) {
            qm.addToEmergencyQueue(reg);
        } else {
            qm.addToNormalQueue(reg);
        }
    }

    outSummary = "Recovered: " + std::to_string(dbPatients.size()) + " patients (Next ID: " +
                 std::to_string(pm.getNextPatientId()) + "), " +
                 std::to_string(dm.getDoctorCount()) + " doctors, " +
                 std::to_string(allConsultations.size()) + " consultations (" +
                 std::to_string(waitingList.size()) + " active waiting in queues). Next Token: " +
                 TokenManager::formatToken(tm.getNextToken());

    Logger::info(outSummary);
    return true;
}
