#include "core/consultation_manager.h"
#include "utils/validation.h"
#include "db/database_manager.h"
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <algorithm>

ConsultationManager::ConsultationManager(QueueManager& qm, PatientManager& pm,
                                         DoctorManager& dm, TokenManager& tm)
    : queueManager(qm), patientManager(pm), doctorManager(dm), tokenManager(tm), dbManager(nullptr) {}

static std::string getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::tm timeInfo;
#if defined(_WIN32)
    localtime_s(&timeInfo, &in_time_t);
#else
    localtime_r(&in_time_t, &timeInfo);
#endif
    std::ostringstream oss;
    oss << std::put_time(&timeInfo, "%Y-%m-%d %H:%M:%S");
    return oss.str();
}

bool ConsultationManager::hasActiveWaitingConsultation(int patientId, int& outTokenNo, int& outDoctorId) const {
    // 1. Check active queues via QueueManager
    if (queueManager.isPatientWaiting(patientId, outTokenNo, outDoctorId)) {
        return true;
    }
    // 2. Also check consultation history in case of records marked Waiting
    for (const auto& pair : consultationHistory) {
        if (pair.second.patientId == patientId && pair.second.status == "Waiting") {
            outTokenNo = pair.second.tokenNo;
            outDoctorId = pair.second.doctorId;
            return true;
        }
    }
    return false;
}

bool ConsultationManager::registerConsultation(int patientId, const std::string& healthIssue,
                                              int doctorId, bool emergency,
                                              ConsultationRecord& outRecord, std::string& errorMsg) {
    // 1. Verify Patient exists
    Patient patient;
    if (!patientManager.findPatientById(patientId, patient)) {
        errorMsg = "Patient ID " + std::to_string(patientId) +
                   " not found. Patient must be registered before booking a consultation.";
        return false;
    }

    // 2. Verify Doctor exists
    Doctor doctor;
    if (!doctorManager.getDoctorById(doctorId, doctor)) {
        errorMsg = "Doctor ID " + std::to_string(doctorId) +
                   " not found. Please select a valid doctor.";
        return false;
    }

    // 3. Verify Health Issue non-empty
    if (!Validation::isNonEmpty(healthIssue)) {
        errorMsg = "Health issue / symptoms description cannot be empty.";
        return false;
    }

    // 4. Duplicate Active Consultation Check
    int existingToken = 0;
    int existingDoctorId = 0;
    if (hasActiveWaitingConsultation(patientId, existingToken, existingDoctorId)) {
        Doctor existingDoc;
        std::string docDetails = "Doctor ID: " + std::to_string(existingDoctorId);
        if (doctorManager.getDoctorById(existingDoctorId, existingDoc)) {
            docDetails = existingDoc.doctorName + " (Room " + std::to_string(existingDoc.roomNo) + ")";
        }
        errorMsg = "Patient '" + patient.patientName + "' (ID: " + std::to_string(patientId) +
                   ") already has an active waiting consultation (Token: " +
                   TokenManager::formatToken(existingToken) + " with " + docDetails +
                   "). Cannot register duplicate active consultation.";
        return false;
    }

    // 5. Generate common/global token
    int token = tokenManager.generateToken();

    // 6. Push to appropriate doctor queue (DSA Engine)
    QueueRegistration reg(token, patientId, healthIssue, doctorId, emergency);
    if (emergency) {
        queueManager.addToEmergencyQueue(reg);
    } else {
        queueManager.addToNormalQueue(reg);
    }

    // 7. Record consultation in memory
    outRecord.tokenNo = token;
    outRecord.patientId = patientId;
    outRecord.patientName = patient.patientName;
    outRecord.doctorId = doctorId;
    outRecord.doctorName = doctor.doctorName;
    outRecord.roomNo = doctor.roomNo;
    outRecord.healthIssue = healthIssue;
    outRecord.emergency = emergency;
    outRecord.status = "Waiting";
    outRecord.createdAt = getCurrentTimestamp();
    outRecord.updatedAt = outRecord.createdAt;

    consultationHistory[token] = outRecord;

    if (dbManager && dbManager->isConnected()) {
        dbManager->saveConsultation(outRecord);
    }

    return true;
}

bool ConsultationManager::findConsultationByToken(int tokenNo, ConsultationRecord& outRecord) const {
    auto it = consultationHistory.find(tokenNo);
    if (it != consultationHistory.end()) {
        outRecord = it->second;
        return true;
    }
    return false;
}

std::vector<ConsultationRecord> ConsultationManager::getConsultationsByPatientId(int patientId) const {
    std::vector<ConsultationRecord> list;
    for (const auto& pair : consultationHistory) {
        if (pair.second.patientId == patientId) {
            list.push_back(pair.second);
        }
    }
    std::sort(list.begin(), list.end(), [](const ConsultationRecord& a, const ConsultationRecord& b) {
        return a.tokenNo < b.tokenNo;
    });
    return list;
}

std::vector<ConsultationRecord> ConsultationManager::getConsultationsByDoctorId(int doctorId) const {
    std::vector<ConsultationRecord> list;
    for (const auto& pair : consultationHistory) {
        if (pair.second.doctorId == doctorId) {
            list.push_back(pair.second);
        }
    }
    std::sort(list.begin(), list.end(), [](const ConsultationRecord& a, const ConsultationRecord& b) {
        return a.tokenNo < b.tokenNo;
    });
    return list;
}

std::vector<ConsultationRecord> ConsultationManager::getAllConsultations() const {
    std::vector<ConsultationRecord> list;
    list.reserve(consultationHistory.size());
    for (const auto& pair : consultationHistory) {
        list.push_back(pair.second);
    }
    std::sort(list.begin(), list.end(), [](const ConsultationRecord& a, const ConsultationRecord& b) {
        return a.tokenNo < b.tokenNo;
    });
    return list;
}

bool ConsultationManager::processNextPatient(int doctorId, ConsultationRecord& outRecord, std::string& errorMsg) {
    Doctor doc;
    if (!doctorManager.getDoctorById(doctorId, doc)) {
        errorMsg = "Doctor ID " + std::to_string(doctorId) + " not found.";
        return false;
    }

    QueueRegistration reg;
    if (!queueManager.processNextPatient(doctorId, reg)) {
        errorMsg = "No waiting patients for " + doc.doctorName + " (Room " + std::to_string(doc.roomNo) + ").";
        return false;
    }

    auto it = consultationHistory.find(reg.tokenNo);
    if (it != consultationHistory.end()) {
        it->second.status = "Completed";
        it->second.updatedAt = getCurrentTimestamp();
        outRecord = it->second;
    } else {
        // Fallback reconstruction if record was not previously stored
        Patient pat;
        patientManager.findPatientById(reg.patientId, pat);
        outRecord.tokenNo = reg.tokenNo;
        outRecord.patientId = reg.patientId;
        outRecord.patientName = pat.patientName;
        outRecord.doctorId = reg.doctorId;
        outRecord.doctorName = doc.doctorName;
        outRecord.roomNo = doc.roomNo;
        outRecord.healthIssue = reg.healthIssue;
        outRecord.emergency = reg.emergency;
        outRecord.status = "Completed";
        outRecord.createdAt = getCurrentTimestamp();
        outRecord.updatedAt = outRecord.createdAt;
        consultationHistory[reg.tokenNo] = outRecord;
    }

    if (dbManager && dbManager->isConnected()) {
        dbManager->updateConsultationStatus(outRecord.tokenNo, "Completed");
    }

    return true;
}

bool ConsultationManager::completeConsultation(int tokenNo, std::string& errorMsg) {
    auto it = consultationHistory.find(tokenNo);
    if (it == consultationHistory.end()) {
        errorMsg = "Consultation token " + TokenManager::formatToken(tokenNo) + " not found.";
        return false;
    }

    if (it->second.status != "Waiting") {
        errorMsg = "Only waiting consultations can be completed. Current status: " + it->second.status;
        return false;
    }

    // Remove from in-memory queue if still present
    queueManager.removeFromQueue(it->second.doctorId, tokenNo, it->second.emergency);

    it->second.status = "Completed";
    it->second.updatedAt = getCurrentTimestamp();

    if (dbManager && dbManager->isConnected()) {
        dbManager->updateConsultationStatus(tokenNo, "Completed");
    }

    return true;
}

bool ConsultationManager::cancelConsultation(int tokenNo, std::string& errorMsg) {
    auto it = consultationHistory.find(tokenNo);
    if (it == consultationHistory.end()) {
        errorMsg = "Consultation token " + TokenManager::formatToken(tokenNo) + " not found.";
        return false;
    }

    if (it->second.status != "Waiting") {
        errorMsg = "Only waiting consultations can be cancelled. Current status: " + it->second.status;
        return false;
    }

    // Remove from in-memory queue (middle-element queue reconstruction)
    queueManager.removeFromQueue(it->second.doctorId, tokenNo, it->second.emergency);

    it->second.status = "Cancelled";
    it->second.updatedAt = getCurrentTimestamp();

    if (dbManager && dbManager->isConnected()) {
        dbManager->updateConsultationStatus(tokenNo, "Cancelled");
    }

    return true;
}

bool ConsultationManager::updateConsultation(int tokenNo, int newDoctorId, bool newEmergency,
                                             const std::string& newHealthIssue, std::string& errorMsg) {
    auto it = consultationHistory.find(tokenNo);
    if (it == consultationHistory.end()) {
        errorMsg = "Consultation token " + TokenManager::formatToken(tokenNo) + " not found.";
        return false;
    }

    if (it->second.status != "Waiting") {
        errorMsg = "Only waiting consultations can be updated. Current status: " + it->second.status;
        return false;
    }

    Doctor doc;
    if (!doctorManager.getDoctorById(newDoctorId, doc)) {
        errorMsg = "New Doctor ID " + std::to_string(newDoctorId) + " not found.";
        return false;
    }

    if (!Validation::isNonEmpty(newHealthIssue)) {
        errorMsg = "Health issue cannot be empty.";
        return false;
    }

    // If doctor or emergency status changed, transfer between queues
    if (it->second.doctorId != newDoctorId || it->second.emergency != newEmergency) {
        queueManager.removeFromQueue(it->second.doctorId, tokenNo, it->second.emergency);

        QueueRegistration reg(tokenNo, it->second.patientId, newHealthIssue, newDoctorId, newEmergency);
        if (newEmergency) {
            queueManager.addToEmergencyQueue(reg);
        } else {
            queueManager.addToNormalQueue(reg);
        }
    }

    it->second.doctorId = newDoctorId;
    it->second.doctorName = doc.doctorName;
    it->second.roomNo = doc.roomNo;
    it->second.emergency = newEmergency;
    it->second.healthIssue = newHealthIssue;
    it->second.updatedAt = getCurrentTimestamp();

    if (dbManager && dbManager->isConnected()) {
        dbManager->updateConsultation(it->second);
    }

    return true;
}

int ConsultationManager::countWaitingConsultations() const {
    int count = 0;
    for (const auto& pair : consultationHistory) {
        if (pair.second.status == "Waiting") count++;
    }
    return count;
}

int ConsultationManager::countCompletedConsultations() const {
    int count = 0;
    for (const auto& pair : consultationHistory) {
        if (pair.second.status == "Completed") count++;
    }
    return count;
}

int ConsultationManager::countCancelledConsultations() const {
    int count = 0;
    for (const auto& pair : consultationHistory) {
        if (pair.second.status == "Cancelled") count++;
    }
    return count;
}

int ConsultationManager::countTotalConsultations() const {
    return static_cast<int>(consultationHistory.size());
}

void ConsultationManager::clearAllConsultations() {
    consultationHistory.clear();
}

void ConsultationManager::loadConsultations(const std::vector<ConsultationRecord>& records) {
    for (const auto& r : records) {
        consultationHistory[r.tokenNo] = r;
        if (tokenManager.getNextToken() <= r.tokenNo) {
            tokenManager.setNextToken(r.tokenNo + 1);
        }
    }
}
