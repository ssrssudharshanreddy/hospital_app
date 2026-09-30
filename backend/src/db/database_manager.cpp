#include "db/database_manager.h"
#include "utils/logger.h"
#include "third_party/json.hpp"
#include <windows.h>
#include <fstream>
#include <cstdio>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>

using json = nlohmann::json;

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

DatabaseManager::DatabaseManager() : connected(false), lastError("") {}

bool DatabaseManager::runMongoScript(const std::string& script, std::string& outOutput, std::string& outError) {
    char tempPath[MAX_PATH];
    if (!GetTempPathA(MAX_PATH, tempPath)) {
        outError = "Failed to determine Windows temporary directory path.";
        lastError = outError;
        return false;
    }
    char tempFile[MAX_PATH];
    if (!GetTempFileNameA(tempPath, "hsq", 0, tempFile)) {
        outError = "Failed to generate unique temporary filename.";
        lastError = outError;
        return false;
    }
    std::string scriptPath = std::string(tempFile) + ".js";

    std::ofstream ofs(scriptPath);
    if (!ofs.is_open()) {
        outError = "Failed to write temporary MongoDB script file: " + scriptPath;
        lastError = outError;
        return false;
    }
    ofs << "const db = db.getSiblingDB('" << config.databaseName << "');\n";
    ofs << script;
    ofs.close();

    std::string targetDbUri = config.uri;
    size_t qPos = targetDbUri.find('?');
    if (qPos == std::string::npos) {
        if (!targetDbUri.empty() && targetDbUri.back() != '/') {
            targetDbUri += '/';
        }
        targetDbUri += config.databaseName;
    } else {
        size_t slashBeforeQ = targetDbUri.rfind('/', qPos);
        if (slashBeforeQ != std::string::npos && slashBeforeQ + 1 == qPos) {
            targetDbUri.insert(qPos, config.databaseName);
        } else if (slashBeforeQ == std::string::npos) {
            targetDbUri.insert(qPos, "/" + config.databaseName);
        }
    }

    std::string cmd = "mongosh \"" + targetDbUri + "\" --quiet --file \"" + scriptPath + "\" 2>&1";

    FILE* pipe = _popen(cmd.c_str(), "r");
    if (!pipe) {
        outError = "Failed to spawn mongosh process.";
        lastError = outError;
        std::remove(scriptPath.c_str());
        std::remove(tempFile);
        return false;
    }

    char buffer[1024];
    std::string result;
    while (fgets(buffer, sizeof(buffer), pipe) != nullptr) {
        result += buffer;
    }

    int exitCode = _pclose(pipe);
    std::remove(scriptPath.c_str());
    std::remove(tempFile);

    if (exitCode != 0) {
        outError = result;
        lastError = result;
        return false;
    }

    outOutput = result;
    return true;
}

bool DatabaseManager::ping() {
    std::string script = "print(JSON.stringify(db.runCommand({ping: 1})));";
    std::string out, err;
    if (!runMongoScript(script, out, err)) {
        connected = false;
        lastError = "MongoDB ping failed: " + err;
        return false;
    }
    try {
        auto j = json::parse(out);
        if (j.contains("ok") && j["ok"] == 1) {
            connected = true;
            return true;
        }
    } catch (...) {
        connected = false;
        lastError = "Failed to parse MongoDB ping response: " + out;
        return false;
    }
    connected = false;
    return false;
}

bool DatabaseManager::initialize(const MongoConfig& cfg) {
    config = cfg;
    connected = ping();
    if (!connected) {
        Logger::warn("MongoDB unavailable at " + config.getSanitizedUri() + ". Database manager initialized in disconnected state.");
    } else {
        Logger::info("Connected to MongoDB at " + config.getSanitizedUri() + " (Database: " + config.databaseName + ")");
    }
    return connected;
}

bool DatabaseManager::isConnected() const {
    return connected;
}

std::string DatabaseManager::getLastError() const {
    return lastError;
}

// -------------------------------------------------------------
// Patients Collection CRUD
// -------------------------------------------------------------

bool DatabaseManager::savePatient(const Patient& patient) {
    if (!connected && !ping()) {
        lastError = "MongoDB not connected.";
        return false;
    }

    json doc;
    doc["patientId"] = patient.patientId;
    doc["patientName"] = patient.patientName;
    doc["age"] = patient.age;
    doc["gender"] = patient.gender;
    doc["phone"] = patient.phone;

    std::string script = "print(JSON.stringify(db." + config.patientsCollection +
                         ".updateOne({patientId: " + std::to_string(patient.patientId) +
                         "}, {$set: " + doc.dump() + "}, {upsert: true})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        auto j = json::parse(out);
        return j.value("acknowledged", false);
    } catch (...) {
        lastError = "Failed to parse savePatient response.";
        return false;
    }
}

bool DatabaseManager::getPatientById(int id, Patient& outPatient) {
    if (!connected && !ping()) return false;

    std::string script = "print(JSON.stringify(db." + config.patientsCollection +
                         ".findOne({patientId: " + std::to_string(id) + "}, {_id: 0})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        if (out.find("null") == 0 || out.empty()) return false;
        auto j = json::parse(out);
        if (j.is_null()) return false;
        outPatient.patientId = j.value("patientId", 0);
        outPatient.patientName = j.value("patientName", "");
        outPatient.age = j.value("age", 0);
        outPatient.gender = j.value("gender", "");
        outPatient.phone = j.value("phone", "");
        return true;
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::getPatientByPhone(const std::string& phone, Patient& outPatient) {
    if (!connected && !ping()) return false;

    json filter;
    filter["phone"] = phone;
    std::string script = "print(JSON.stringify(db." + config.patientsCollection +
                         ".findOne(" + filter.dump() + ", {_id: 0})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        if (out.find("null") == 0 || out.empty()) return false;
        auto j = json::parse(out);
        if (j.is_null()) return false;
        outPatient.patientId = j.value("patientId", 0);
        outPatient.patientName = j.value("patientName", "");
        outPatient.age = j.value("age", 0);
        outPatient.gender = j.value("gender", "");
        outPatient.phone = j.value("phone", "");
        return true;
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::updatePatient(const Patient& patient) {
    if (!connected && !ping()) return false;

    json setDoc;
    setDoc["patientName"] = patient.patientName;
    setDoc["age"] = patient.age;
    setDoc["gender"] = patient.gender;
    setDoc["phone"] = patient.phone;

    std::string script = "print(JSON.stringify(db." + config.patientsCollection +
                         ".updateOne({patientId: " + std::to_string(patient.patientId) +
                         "}, {$set: " + setDoc.dump() + "})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        auto j = json::parse(out);
        return j.value("acknowledged", false) && (j.value("matchedCount", 0) > 0);
    } catch (...) {
        return false;
    }
}

std::vector<Patient> DatabaseManager::getAllPatients() {
    if (!connected && !ping()) return {};

    std::string script = "print(JSON.stringify(db." + config.patientsCollection +
                         ".find({}, {_id: 0}).sort({patientId: 1}).toArray()));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return {};
    std::vector<Patient> list;
    try {
        auto j = json::parse(out);
        if (j.is_array()) {
            for (const auto& item : j) {
                Patient p;
                p.patientId = item.value("patientId", 0);
                p.patientName = item.value("patientName", "");
                p.age = item.value("age", 0);
                p.gender = item.value("gender", "");
                p.phone = item.value("phone", "");
                list.push_back(p);
            }
        }
    } catch (...) {}
    return list;
}

bool DatabaseManager::clearPatients() {
    if (!connected && !ping()) return false;
    std::string script = "print(JSON.stringify(db." + config.patientsCollection + ".deleteMany({})));";
    std::string out, err;
    return runMongoScript(script, out, err);
}

// -------------------------------------------------------------
// Doctors Collection CRUD
// -------------------------------------------------------------

bool DatabaseManager::saveDoctor(const Doctor& doctor) {
    if (!connected && !ping()) return false;

    json doc;
    doc["doctorId"] = doctor.doctorId;
    doc["doctorName"] = doctor.doctorName;
    doc["specialization"] = doctor.specialization;
    doc["roomNo"] = doctor.roomNo;

    std::string script = "print(JSON.stringify(db." + config.doctorsCollection +
                         ".updateOne({doctorId: " + std::to_string(doctor.doctorId) +
                         "}, {$set: " + doc.dump() + "}, {upsert: true})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        auto j = json::parse(out);
        return j.value("acknowledged", false);
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::getDoctorById(int id, Doctor& outDoctor) {
    if (!connected && !ping()) return false;

    std::string script = "print(JSON.stringify(db." + config.doctorsCollection +
                         ".findOne({doctorId: " + std::to_string(id) + "}, {_id: 0})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        if (out.find("null") == 0 || out.empty()) return false;
        auto j = json::parse(out);
        if (j.is_null()) return false;
        outDoctor.doctorId = j.value("doctorId", 0);
        outDoctor.doctorName = j.value("doctorName", "");
        outDoctor.specialization = j.value("specialization", "");
        outDoctor.roomNo = j.value("roomNo", 0);
        return true;
    } catch (...) {
        return false;
    }
}

std::vector<Doctor> DatabaseManager::getAllDoctors() {
    if (!connected && !ping()) return {};

    std::string script = "print(JSON.stringify(db." + config.doctorsCollection +
                         ".find({}, {_id: 0}).sort({doctorId: 1}).toArray()));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return {};
    std::vector<Doctor> list;
    try {
        auto j = json::parse(out);
        if (j.is_array()) {
            for (const auto& item : j) {
                Doctor d;
                d.doctorId = item.value("doctorId", 0);
                d.doctorName = item.value("doctorName", "");
                d.specialization = item.value("specialization", "");
                d.roomNo = item.value("roomNo", 0);
                list.push_back(d);
            }
        }
    } catch (...) {}
    return list;
}

bool DatabaseManager::clearDoctors() {
    if (!connected && !ping()) return false;
    std::string script = "print(JSON.stringify(db." + config.doctorsCollection + ".deleteMany({})));";
    std::string out, err;
    return runMongoScript(script, out, err);
}

// -------------------------------------------------------------
// Consultations Collection CRUD
// -------------------------------------------------------------

bool DatabaseManager::saveConsultation(const ConsultationRecord& record) {
    if (!connected && !ping()) return false;

    json doc;
    doc["tokenNo"] = record.tokenNo;
    doc["patientId"] = record.patientId;
    doc["patientName"] = record.patientName;
    doc["doctorId"] = record.doctorId;
    doc["doctorName"] = record.doctorName;
    doc["roomNo"] = record.roomNo;
    doc["healthIssue"] = record.healthIssue;
    doc["emergency"] = record.emergency;
    doc["status"] = record.status;
    doc["createdAt"] = record.createdAt;
    doc["updatedAt"] = record.updatedAt;

    std::string script = "print(JSON.stringify(db." + config.consultationsCollection +
                         ".updateOne({tokenNo: " + std::to_string(record.tokenNo) +
                         "}, {$set: " + doc.dump() + "}, {upsert: true})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        auto j = json::parse(out);
        return j.value("acknowledged", false);
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::updateConsultationStatus(int tokenNo, const std::string& status) {
    if (!connected && !ping()) return false;

    std::string nowStr = getCurrentTimestamp();
    std::string script = "print(JSON.stringify(db." + config.consultationsCollection +
                         ".updateOne({tokenNo: " + std::to_string(tokenNo) +
                         "}, {$set: {status: '" + status + "', updatedAt: '" + nowStr + "'}})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        auto j = json::parse(out);
        return j.value("acknowledged", false) && (j.value("matchedCount", 0) > 0);
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::updateConsultation(const ConsultationRecord& record) {
    if (!connected && !ping()) return false;

    json setObj;
    setObj["doctorId"] = record.doctorId;
    setObj["doctorName"] = record.doctorName;
    setObj["roomNo"] = record.roomNo;
    setObj["healthIssue"] = record.healthIssue;
    setObj["emergency"] = record.emergency;
    setObj["status"] = record.status;
    setObj["updatedAt"] = record.updatedAt;

    std::string script = "print(JSON.stringify(db." + config.consultationsCollection +
                         ".updateOne({tokenNo: " + std::to_string(record.tokenNo) +
                         "}, {$set: " + setObj.dump() + "})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        auto j = json::parse(out);
        return j.value("acknowledged", false) && (j.value("matchedCount", 0) > 0);
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::getConsultationByToken(int tokenNo, ConsultationRecord& outRecord) {
    if (!connected && !ping()) return false;

    std::string script = "print(JSON.stringify(db." + config.consultationsCollection +
                         ".findOne({tokenNo: " + std::to_string(tokenNo) + "}, {_id: 0})));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return false;
    try {
        if (out.find("null") == 0 || out.empty()) return false;
        auto j = json::parse(out);
        if (j.is_null()) return false;
        outRecord.tokenNo = j.value("tokenNo", 0);
        outRecord.patientId = j.value("patientId", 0);
        outRecord.patientName = j.value("patientName", "");
        outRecord.doctorId = j.value("doctorId", 0);
        outRecord.doctorName = j.value("doctorName", "");
        outRecord.roomNo = j.value("roomNo", 0);
        outRecord.healthIssue = j.value("healthIssue", "");
        outRecord.emergency = j.value("emergency", false);
        outRecord.status = j.value("status", "Waiting");
        outRecord.createdAt = j.value("createdAt", "");
        outRecord.updatedAt = j.value("updatedAt", "");
        return true;
    } catch (...) {
        return false;
    }
}

std::vector<ConsultationRecord> DatabaseManager::getAllConsultations() {
    if (!connected && !ping()) return {};

    std::string script = "print(JSON.stringify(db." + config.consultationsCollection +
                         ".find({}, {_id: 0}).sort({tokenNo: 1}).toArray()));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return {};
    std::vector<ConsultationRecord> list;
    try {
        auto j = json::parse(out);
        if (j.is_array()) {
            for (const auto& item : j) {
                ConsultationRecord rec;
                rec.tokenNo = item.value("tokenNo", 0);
                rec.patientId = item.value("patientId", 0);
                rec.patientName = item.value("patientName", "");
                rec.doctorId = item.value("doctorId", 0);
                rec.doctorName = item.value("doctorName", "");
                rec.roomNo = item.value("roomNo", 0);
                rec.healthIssue = item.value("healthIssue", "");
                rec.emergency = item.value("emergency", false);
                rec.status = item.value("status", "Waiting");
                rec.createdAt = item.value("createdAt", "");
                rec.updatedAt = item.value("updatedAt", "");
                list.push_back(rec);
            }
        }
    } catch (...) {}
    return list;
}

std::vector<ConsultationRecord> DatabaseManager::getWaitingConsultations() {
    if (!connected && !ping()) return {};

    std::string script = "print(JSON.stringify(db." + config.consultationsCollection +
                         ".find({status: 'Waiting'}, {_id: 0}).sort({tokenNo: 1}).toArray()));";

    std::string out, err;
    if (!runMongoScript(script, out, err)) return {};
    std::vector<ConsultationRecord> list;
    try {
        auto j = json::parse(out);
        if (j.is_array()) {
            for (const auto& item : j) {
                ConsultationRecord rec;
                rec.tokenNo = item.value("tokenNo", 0);
                rec.patientId = item.value("patientId", 0);
                rec.patientName = item.value("patientName", "");
                rec.doctorId = item.value("doctorId", 0);
                rec.doctorName = item.value("doctorName", "");
                rec.roomNo = item.value("roomNo", 0);
                rec.healthIssue = item.value("healthIssue", "");
                rec.emergency = item.value("emergency", false);
                rec.status = item.value("status", "Waiting");
                rec.createdAt = item.value("createdAt", "");
                rec.updatedAt = item.value("updatedAt", "");
                list.push_back(rec);
            }
        }
    } catch (...) {}
    return list;
}

bool DatabaseManager::clearConsultations() {
    if (!connected && !ping()) return false;
    std::string script = "print(JSON.stringify(db." + config.consultationsCollection + ".deleteMany({})));";
    std::string out, err;
    return runMongoScript(script, out, err);
}

bool DatabaseManager::clearAllData() {
    bool ok1 = clearPatients();
    bool ok2 = clearDoctors();
    bool ok3 = clearConsultations();
    return ok1 && ok2 && ok3;
}
