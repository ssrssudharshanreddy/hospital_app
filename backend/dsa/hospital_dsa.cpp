#include "hospital_dsa.h"
#include "utils/validation.h"
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <cctype>
using namespace std;

static string getCurrentTimestamp() {
    auto now = chrono::system_clock::now();
    auto in_time_t = chrono::system_clock::to_time_t(now);
    tm timeInfo;
#if defined(_WIN32)
    localtime_s(&timeInfo, &in_time_t);
#else
    localtime_r(&in_time_t, &timeInfo);
#endif
    ostringstream oss;
    oss << put_time(&timeInfo, "%Y-%m-%d %H:%M:%S");
    return oss.str();
}

static string getCurrentDate() {
    auto now = chrono::system_clock::now();
    auto in_time_t = chrono::system_clock::to_time_t(now);
    tm timeInfo;
#if defined(_WIN32)
    localtime_s(&timeInfo, &in_time_t);
#else
    localtime_r(&in_time_t, &timeInfo);
#endif
    ostringstream oss;
    oss << put_time(&timeInfo, "%Y-%m-%d");
    return oss.str();
}

HospitalDSA::HospitalDSA() : nextPatientId(101), nextTokenNumber(1), currentDate(getCurrentDate()) {
    for (int i = 0; i < MAX_DOCTORS; ++i) {
        hasActiveConsultation[i] = false;
    }
}

int HospitalDSA::getDoctorIndex(int doctorId) const {
    for (size_t i = 0; i < doctors.size(); ++i) {
        if (doctors[i].doctorId == doctorId) {
            return static_cast<int>(i);
        }
    }
    return -1;
}

bool HospitalDSA::registerPatient(const string& name, int age, const string& gender,
                                   const string& phone, Patient& outPatient, string& errorMsg) {
    if (!Validation::isNonEmpty(name)) {
        errorMsg = "Patient name cannot be empty.";
        return false;
    }
    if (!Validation::isValidAge(age)) {
        errorMsg = "Age must be between 1 and 120.";
        return false;
    }
    if (!Validation::isValidGender(gender)) {
        errorMsg = "Invalid gender. Must be Male, Female, or Other.";
        return false;
    }
    if (!Validation::isValidPhone(phone)) {
        errorMsg = "Phone number must be exactly 10 digits.";
        return false;
    }

    Patient existing;
    if (findPatientByPhone(phone, existing) != -1) {
        errorMsg = "Patient with phone number " + phone + " is already registered (Patient ID: #" +
                   to_string(existing.patientId) + ").";
        return false;
    }

    int newId = nextPatientId++;
    Patient newPatient(newId, name, age, gender, phone);
    patients.push_back(newPatient);

    outPatient = newPatient;
    return true;
}

int HospitalDSA::findPatientById(int patientId, Patient& outPatient) const {
    for (size_t i = 0; i < patients.size(); ++i) {
        if (patients[i].patientId == patientId) {
            outPatient = patients[i];
            return static_cast<int>(i);
        }
    }
    return -1;
}

int HospitalDSA::findPatientByPhone(const string& phone, Patient& outPatient) const {
    for (size_t i = 0; i < patients.size(); ++i) {
        if (patients[i].phone == phone) {
            outPatient = patients[i];
            return static_cast<int>(i);
        }
    }
    return -1;
}

bool HospitalDSA::updatePatient(int patientId, const string& name, int age,
                                 const string& gender, const string& phone, string& errorMsg) {
    Patient target;
    int index = findPatientById(patientId, target);
    if (index == -1) {
        errorMsg = "Patient ID #" + to_string(patientId) + " not found.";
        return false;
    }

    if (!Validation::isNonEmpty(name)) {
        errorMsg = "Patient name cannot be empty.";
        return false;
    }
    if (!Validation::isValidAge(age)) {
        errorMsg = "Age must be between 1 and 120.";
        return false;
    }
    if (!Validation::isValidGender(gender)) {
        errorMsg = "Invalid gender. Must be Male, Female, or Other.";
        return false;
    }
    if (!Validation::isValidPhone(phone)) {
        errorMsg = "Phone number must be exactly 10 digits.";
        return false;
    }

    if (phone != target.phone) {
        Patient other;
        if (findPatientByPhone(phone, other) != -1) {
            errorMsg = "Phone number " + phone + " is already used by Patient #" +
                       to_string(other.patientId) + ".";
            return false;
        }
    }

    patients[index].name = name;
    patients[index].age = age;
    patients[index].gender = gender;
    patients[index].phone = phone;
    return true;
}

bool HospitalDSA::bookConsultation(int patientId, int doctorId, const string& healthIssue,
                                    bool isEmergency, Registration& outReg, string& errorMsg) {
    if (patientId <= 0) {
        errorMsg = "Patient ID must be a positive integer.";
        return false;
    }
    if (doctorId <= 0) {
        errorMsg = "Doctor ID must be a positive integer.";
        return false;
    }
    if (!Validation::isNonEmpty(healthIssue)) {
        errorMsg = "Health issue cannot be empty.";
        return false;
    }

    Patient patient;
    if (findPatientById(patientId, patient) == -1) {
        errorMsg = "Patient ID #" + to_string(patientId) + " does not exist.";
        return false;
    }

    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) {
        errorMsg = "Doctor ID #" + to_string(doctorId) + " does not exist.";
        return false;
    }
    Doctor doctor = doctors[dIdx];

    for (const auto& record : consultationHistory) {
        if (record.patientId == patientId && (record.status == "Waiting" || record.status == "In Consultation" || record.status == "IN_CONSULTATION")) {
            errorMsg = "Patient #" + to_string(patientId) +
                       " already has an active consultation (Token #" +
                       to_string(record.tokenNo) + ", Status: " + record.status + ").";
            return false;
        }
    }

    bool targetFull = isEmergency ? emergencyQueues[dIdx].isFull() : normalQueues[dIdx].isFull();
    if (targetFull) {
        errorMsg = "Consultation queue is full for Doctor " + doctor.name + ".";
        return false;
    }

    string today = getCurrentDate();
    if (today != currentDate) {
        currentDate = today;
        nextTokenNumber = 1;
    }

    int token = nextTokenNumber++;

    Registration reg;
    reg.tokenNo = token;
    reg.patientId = patientId;
    reg.patientName = patient.name;
    reg.doctorId = doctorId;
    reg.doctorName = doctor.name;
    reg.roomNo = doctor.roomNo;
    reg.healthIssue = healthIssue;
    reg.emergency = isEmergency;
    reg.status = "Waiting";
    reg.createdAt = getCurrentTimestamp();
    reg.updatedAt = reg.createdAt;

    bool enqueued = false;
    if (isEmergency) {
        enqueued = emergencyQueues[dIdx].enqueue(reg);
    } else {
        enqueued = normalQueues[dIdx].enqueue(reg);
    }

    if (!enqueued) {
        nextTokenNumber--;
        errorMsg = "Consultation queue is full for Doctor " + doctor.name + ".";
        return false;
    }

    consultationHistory.push_back(reg);
    outReg = reg;
    return true;
}

bool HospitalDSA::processNextPatient(int doctorId, Registration& outProcessed, string& errorMsg) {
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) {
        errorMsg = "Doctor ID #" + to_string(doctorId) + " not found.";
        return false;
    }

    if (hasActiveConsultation[dIdx]) {
        errorMsg = "Doctor " + doctors[dIdx].name + " is already consulting with Token #" +
                   to_string(currentConsultations[dIdx].tokenNo) + " (" +
                   currentConsultations[dIdx].patientName + "). Complete the consultation first.";
        return false;
    }

    bool dequeued = false;

    if (!emergencyQueues[dIdx].isEmpty()) {
        dequeued = emergencyQueues[dIdx].dequeue(outProcessed);
    } else if (!normalQueues[dIdx].isEmpty()) {
        dequeued = normalQueues[dIdx].dequeue(outProcessed);
    } else {
        errorMsg = "No waiting patients in queue for Doctor #" + to_string(doctorId) + ".";
        return false;
    }

    if (!dequeued) {
        errorMsg = "Failed to dequeue patient.";
        return false;
    }

    outProcessed.status = "In Consultation";
    outProcessed.updatedAt = getCurrentTimestamp();

    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == outProcessed.tokenNo && consultationHistory[i].status == "Waiting") {
            consultationHistory[i].status = "In Consultation";
            consultationHistory[i].updatedAt = outProcessed.updatedAt;
            break;
        }
    }

    currentConsultations[dIdx] = outProcessed;
    hasActiveConsultation[dIdx] = true;

    return true;
}

bool HospitalDSA::completeConsultation(int doctorId, Registration& outCompleted, string& errorMsg) {
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) {
        errorMsg = "Doctor ID #" + to_string(doctorId) + " not found.";
        return false;
    }

    if (!hasActiveConsultation[dIdx]) {
        errorMsg = "No active consultation currently in progress for Doctor #" + to_string(doctorId) + ".";
        return false;
    }

    outCompleted = currentConsultations[dIdx];
    outCompleted.status = "Completed";
    outCompleted.updatedAt = getCurrentTimestamp();

    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == outCompleted.tokenNo &&
            (consultationHistory[i].status == "In Consultation" || consultationHistory[i].status == "IN_CONSULTATION")) {
            consultationHistory[i].status = "Completed";
            consultationHistory[i].updatedAt = outCompleted.updatedAt;
            break;
        }
    }

    hasActiveConsultation[dIdx] = false;
    currentConsultations[dIdx] = Registration();

    return true;
}

bool HospitalDSA::hasCurrentConsultation(int doctorId) const {
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) return false;
    return hasActiveConsultation[dIdx];
}

bool HospitalDSA::getCurrentConsultation(int doctorId, Registration& outReg) const {
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1 || !hasActiveConsultation[dIdx]) return false;
    outReg = currentConsultations[dIdx];
    return true;
}

bool HospitalDSA::cancelConsultation(int tokenNo, string& errorMsg) {
    int targetHistoryIndex = -1;
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == tokenNo && consultationHistory[i].status == "Waiting") {
            targetHistoryIndex = i;
            break;
        }
    }

    if (targetHistoryIndex == -1) {
        for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
            if (consultationHistory[i].tokenNo == tokenNo) {
                targetHistoryIndex = i;
                break;
            }
        }
    }

    if (targetHistoryIndex == -1) {
        errorMsg = "Consultation record with Token #" + to_string(tokenNo) + " not found.";
        return false;
    }

    if (consultationHistory[targetHistoryIndex].status != "Waiting") {
        errorMsg = "Consultation #" + to_string(tokenNo) +
                   " cannot be cancelled because it is already " +
                   consultationHistory[targetHistoryIndex].status + ".";
        return false;
    }

    int docId = consultationHistory[targetHistoryIndex].doctorId;
    int dIdx = getDoctorIndex(docId);
    if (dIdx != -1) {
        emergencyQueues[dIdx].cancelToken(tokenNo);
        normalQueues[dIdx].cancelToken(tokenNo);
    }

    consultationHistory[targetHistoryIndex].status = "Cancelled";
    consultationHistory[targetHistoryIndex].updatedAt = getCurrentTimestamp();
    return true;
}

bool HospitalDSA::findConsultationByToken(int tokenNo, Registration& outReg) const {
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == tokenNo &&
            (consultationHistory[i].status == "Waiting" || consultationHistory[i].status == "In Consultation" || consultationHistory[i].status == "IN_CONSULTATION")) {
            outReg = consultationHistory[i];
            return true;
        }
    }

    string today = getCurrentDate();
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        string cDate = consultationHistory[i].createdAt.length() >= 10 ? consultationHistory[i].createdAt.substr(0, 10) : "";
        if (consultationHistory[i].tokenNo == tokenNo && cDate == today) {
            outReg = consultationHistory[i];
            return true;
        }
    }

    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == tokenNo) {
            outReg = consultationHistory[i];
            return true;
        }
    }
    return false;
}

bool HospitalDSA::updateConsultation(int tokenNo, int newDoctorId, bool newEmergency,
                                     const string& newHealthIssue, string& errorMsg) {
    int targetIdx = -1;
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == tokenNo && consultationHistory[i].status == "Waiting") {
            targetIdx = i;
            break;
        }
    }

    if (targetIdx == -1) {
        for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
            if (consultationHistory[i].tokenNo == tokenNo) {
                targetIdx = i;
                break;
            }
        }
    }

    if (targetIdx == -1) {
        errorMsg = "Consultation record with Token #" + to_string(tokenNo) + " not found.";
        return false;
    }

    if (consultationHistory[targetIdx].status != "Waiting") {
        errorMsg = "Only waiting consultations can be updated. Current status: " +
                   consultationHistory[targetIdx].status;
        return false;
    }

    int newDIdx = getDoctorIndex(newDoctorId);
    if (newDIdx == -1) {
        errorMsg = "Doctor ID #" + to_string(newDoctorId) + " not found.";
        return false;
    }

    if (!Validation::isNonEmpty(newHealthIssue)) {
        errorMsg = "Health issue cannot be empty.";
        return false;
    }

    int oldDoctorId = consultationHistory[targetIdx].doctorId;
    int oldDIdx = getDoctorIndex(oldDoctorId);
    bool oldEmergency = consultationHistory[targetIdx].emergency;

    Doctor newDoc = doctors[newDIdx];
    Registration updatedRec = consultationHistory[targetIdx];
    updatedRec.doctorId = newDoctorId;
    updatedRec.doctorName = newDoc.name;
    updatedRec.roomNo = newDoc.roomNo;
    updatedRec.emergency = newEmergency;
    updatedRec.healthIssue = newHealthIssue;
    updatedRec.updatedAt = getCurrentTimestamp();

    if (oldDoctorId == newDoctorId && oldEmergency == newEmergency) {
        if (oldDIdx != -1) {
            if (oldEmergency) {
                emergencyQueues[oldDIdx].updateToken(tokenNo, updatedRec);
            } else {
                normalQueues[oldDIdx].updateToken(tokenNo, updatedRec);
            }
        }
        consultationHistory[targetIdx] = updatedRec;
        return true;
    }

    bool targetFull = newEmergency ? emergencyQueues[newDIdx].isFull() : normalQueues[newDIdx].isFull();
    if (targetFull) {
        errorMsg = "Consultation queue is full for Doctor " + newDoc.name + ".";
        return false;
    }

    if (oldDIdx != -1) {
        if (oldEmergency) {
            emergencyQueues[oldDIdx].cancelToken(tokenNo);
        } else {
            normalQueues[oldDIdx].cancelToken(tokenNo);
        }
    }

    consultationHistory[targetIdx] = updatedRec;

    if (newEmergency) {
        emergencyQueues[newDIdx].enqueue(updatedRec);
    } else {
        normalQueues[newDIdx].enqueue(updatedRec);
    }

    return true;
}

vector<Registration> HospitalDSA::getWaitingList(int doctorId) const {
    vector<Registration> list;
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) return list;

    int emgCount = emergencyQueues[dIdx].count();
    for (int i = 0; i < emgCount; ++i) {
        list.push_back(emergencyQueues[dIdx].getAt(i));
    }

    int normCount = normalQueues[dIdx].count();
    for (int i = 0; i < normCount; ++i) {
        list.push_back(normalQueues[dIdx].getAt(i));
    }

    return list;
}

vector<Registration> HospitalDSA::getEmergencyQueueSnapshot(int doctorId) const {
    vector<Registration> list;
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) return list;

    int emgCount = emergencyQueues[dIdx].count();
    for (int i = 0; i < emgCount; ++i) {
        list.push_back(emergencyQueues[dIdx].getAt(i));
    }
    return list;
}

vector<Registration> HospitalDSA::getNormalQueueSnapshot(int doctorId) const {
    vector<Registration> list;
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) return list;

    int normCount = normalQueues[dIdx].count();
    for (int i = 0; i < normCount; ++i) {
        list.push_back(normalQueues[dIdx].getAt(i));
    }
    return list;
}

bool HospitalDSA::getNextPatient(int doctorId, Registration& outNext) const {
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) return false;

    if (!emergencyQueues[dIdx].isEmpty()) {
        return emergencyQueues[dIdx].peek(outNext);
    }
    if (!normalQueues[dIdx].isEmpty()) {
        return normalQueues[dIdx].peek(outNext);
    }
    return false;
}

int HospitalDSA::getWaitingCount(int doctorId, bool emergencyOnly) const {
    int dIdx = getDoctorIndex(doctorId);
    if (dIdx == -1) return 0;

    if (emergencyOnly) {
        return emergencyQueues[dIdx].count();
    }
    return emergencyQueues[dIdx].count() + normalQueues[dIdx].count();
}

int HospitalDSA::getTotalWaitingCount() const {
    int total = 0;
    for (size_t i = 0; i < doctors.size() && i < MAX_DOCTORS; ++i) {
        total += emergencyQueues[i].count() + normalQueues[i].count();
    }
    return total;
}

int HospitalDSA::getEmergencyWaitingCount() const {
    int total = 0;
    for (size_t i = 0; i < doctors.size() && i < MAX_DOCTORS; ++i) {
        total += emergencyQueues[i].count();
    }
    return total;
}

int HospitalDSA::getNormalWaitingCount() const {
    int total = 0;
    for (size_t i = 0; i < doctors.size() && i < MAX_DOCTORS; ++i) {
        total += normalQueues[i].count();
    }
    return total;
}

int HospitalDSA::getInConsultationCount() const {
    int count = 0;
    for (size_t i = 0; i < doctors.size() && i < MAX_DOCTORS; ++i) {
        if (hasActiveConsultation[i]) {
            count++;
        }
    }
    return count;
}

int HospitalDSA::getCompletedCount() const {
    int count = 0;
    for (const auto& c : consultationHistory) {
        if (c.status == "Completed") count++;
    }
    return count;
}

int HospitalDSA::getCancelledCount() const {
    int count = 0;
    for (const auto& c : consultationHistory) {
        if (c.status == "Cancelled") count++;
    }
    return count;
}

int HospitalDSA::getTotalConsultationCount() const {
    return static_cast<int>(consultationHistory.size());
}

bool HospitalDSA::addDoctor(const Doctor& doc, string& errorMsg) {
    if (doc.doctorId <= 0) {
        errorMsg = "Doctor ID must be a positive integer.";
        return false;
    }
    if (!Validation::isNonEmpty(doc.name)) {
        errorMsg = "Doctor name cannot be empty.";
        return false;
    }
    if (!Validation::isNonEmpty(doc.specialization)) {
        errorMsg = "Specialization cannot be empty.";
        return false;
    }
    if (doc.roomNo <= 0) {
        errorMsg = "Room number must be a positive integer.";
        return false;
    }
    Doctor existing;
    if (findDoctorById(doc.doctorId, existing)) {
        errorMsg = "Doctor with ID #" + to_string(doc.doctorId) + " already exists.";
        return false;
    }
    if (doctors.size() >= MAX_DOCTORS) {
        errorMsg = "Doctor capacity reached. Maximum allowed is " + to_string(MAX_DOCTORS) + ".";
        return false;
    }
    doctors.push_back(doc);
    return true;
}

bool HospitalDSA::addDoctor(const Doctor& doc) {
    string dummy;
    return addDoctor(doc, dummy);
}

bool HospitalDSA::findDoctorById(int doctorId, Doctor& outDoctor) const {
    int idx = getDoctorIndex(doctorId);
    if (idx != -1) {
        outDoctor = doctors[idx];
        return true;
    }
    return false;
}

const vector<Doctor>& HospitalDSA::getDoctors() const {
    return doctors;
}

const vector<Patient>& HospitalDSA::getPatients() const {
    return patients;
}

const vector<Registration>& HospitalDSA::getAllConsultations() const {
    return consultationHistory;
}

int HospitalDSA::getPatientCount() const {
    return static_cast<int>(patients.size());
}

int HospitalDSA::getDoctorCount() const {
    return static_cast<int>(doctors.size());
}

int HospitalDSA::getNextTokenNumber() const {
    string today = getCurrentDate();
    if (today != currentDate) {
        return 1;
    }
    return nextTokenNumber;
}

string HospitalDSA::getCurrentDateString() const {
    return currentDate;
}

void HospitalDSA::resetDailyTokens(const string& newDate) {
    currentDate = newDate.empty() ? getCurrentDate() : newDate;
    nextTokenNumber = 1;
}

bool HospitalDSA::rollbackPatientRegistration(int patientId) {
    for (size_t i = 0; i < patients.size(); ++i) {
        if (patients[i].patientId == patientId) {
            patients.erase(patients.begin() + i);
            if (nextPatientId == patientId + 1) {
                nextPatientId = patientId;
            }
            return true;
        }
    }
    return false;
}

bool HospitalDSA::rollbackDoctor(int doctorId) {
    for (size_t i = 0; i < doctors.size(); ++i) {
        if (doctors[i].doctorId == doctorId) {
            doctors.erase(doctors.begin() + i);
            return true;
        }
    }
    return false;
}

bool HospitalDSA::rollbackConsultation(int tokenNo) {
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == tokenNo) {
            int dIdx = getDoctorIndex(consultationHistory[i].doctorId);
            if (dIdx != -1) {
                if (consultationHistory[i].emergency) {
                    emergencyQueues[dIdx].cancelToken(tokenNo);
                } else {
                    normalQueues[dIdx].cancelToken(tokenNo);
                }
            }
            consultationHistory.erase(consultationHistory.begin() + i);
            if (nextTokenNumber == tokenNo + 1) {
                nextTokenNumber = tokenNo;
            }
            return true;
        }
    }
    return false;
}

bool HospitalDSA::rollbackCancellation(int tokenNo) {
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == tokenNo) {
            consultationHistory[i].status = "Waiting";
            int dIdx = getDoctorIndex(consultationHistory[i].doctorId);
            if (dIdx != -1) {
                if (consultationHistory[i].emergency) {
                    emergencyQueues[dIdx].enqueueFront(consultationHistory[i]);
                } else {
                    normalQueues[dIdx].enqueueFront(consultationHistory[i]);
                }
            }
            return true;
        }
    }
    return false;
}

bool HospitalDSA::rollbackProcessing(const Registration& reg) {
    int dIdx = getDoctorIndex(reg.doctorId);
    if (dIdx != -1) {
        hasActiveConsultation[dIdx] = false;
        currentConsultations[dIdx] = Registration();
    }
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == reg.tokenNo) {
            consultationHistory[i].status = "Waiting";
            consultationHistory[i].updatedAt = reg.updatedAt;
            if (dIdx != -1) {
                if (reg.emergency) {
                    emergencyQueues[dIdx].enqueueFront(consultationHistory[i]);
                } else {
                    normalQueues[dIdx].enqueueFront(consultationHistory[i]);
                }
            }
            return true;
        }
    }
    return false;
}

bool HospitalDSA::rollbackCompletion(const Registration& reg) {
    int dIdx = getDoctorIndex(reg.doctorId);
    if (dIdx != -1) {
        hasActiveConsultation[dIdx] = true;
        currentConsultations[dIdx] = reg;
        currentConsultations[dIdx].status = "In Consultation";
    }
    for (int i = static_cast<int>(consultationHistory.size()) - 1; i >= 0; --i) {
        if (consultationHistory[i].tokenNo == reg.tokenNo) {
            consultationHistory[i].status = "In Consultation";
            consultationHistory[i].updatedAt = reg.updatedAt;
            return true;
        }
    }
    return false;
}

void HospitalDSA::loadPatient(const Patient& patient) {
    patients.push_back(patient);
    if (patient.patientId >= nextPatientId) {
        nextPatientId = patient.patientId + 1;
    }
}

void HospitalDSA::loadDoctor(const Doctor& doctor) {
    for (const auto& d : doctors) {
        if (d.doctorId == doctor.doctorId) return;
    }
    if (doctors.size() < MAX_DOCTORS) {
        doctors.push_back(doctor);
    }
}

void HospitalDSA::loadConsultation(const Registration& reg) {
    consultationHistory.push_back(reg);

    string regDate = reg.createdAt.length() >= 10 ? reg.createdAt.substr(0, 10) : "";
    if (regDate == currentDate) {
        if (reg.tokenNo >= nextTokenNumber) {
            nextTokenNumber = reg.tokenNo + 1;
        }
    }

    if (reg.status == "Waiting") {
        int dIdx = getDoctorIndex(reg.doctorId);
        if (dIdx != -1) {
            if (reg.emergency) {
                emergencyQueues[dIdx].enqueue(reg);
            } else {
                normalQueues[dIdx].enqueue(reg);
            }
        }
    } else if (reg.status == "In Consultation" || reg.status == "IN_CONSULTATION") {
        int dIdx = getDoctorIndex(reg.doctorId);
        if (dIdx != -1) {
            currentConsultations[dIdx] = reg;
            currentConsultations[dIdx].status = "In Consultation";
            hasActiveConsultation[dIdx] = true;
        }
    }
}

void HospitalDSA::reset() {
    patients.clear();
    doctors.clear();
    consultationHistory.clear();
    nextPatientId = 101;
    currentDate = getCurrentDate();
    nextTokenNumber = 1;
    for (int i = 0; i < MAX_DOCTORS; ++i) {
        normalQueues[i].clear();
        emergencyQueues[i].clear();
        hasActiveConsultation[i] = false;
        currentConsultations[i] = Registration();
    }
}