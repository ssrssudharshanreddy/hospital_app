#define _HAS_STD_BYTE 0
#include "database_manager.h"
#include "third_party/json.hpp"
#if defined(_WIN32)
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <fstream>
#include <cstdio>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <iostream>
using namespace std;

using json = nlohmann::json;

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

DatabaseManager::DatabaseManager() : connected(false), lastError("") {}

bool DatabaseManager::runMongoScript(const string& script, string& outOutput, string& outError) {
    string scriptPath;
#if defined(_WIN32)
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
    scriptPath = string(tempFile) + ".js";
#else
    static unsigned long long counter = 0;
    auto nowNs = chrono::high_resolution_clock::now().time_since_epoch().count();
    string tempFile = "/tmp/hsq_" + to_string(nowNs) + "_" + to_string(++counter);
    scriptPath = tempFile + ".js";
#endif

    ofstream ofs(scriptPath);
    if (!ofs.is_open()) {
        outError = "Failed to write temporary MongoDB script file: " + scriptPath;
        lastError = outError;
#if defined(_WIN32)
        remove(tempFile);
#endif
        return false;
    }
    ofs << "const db = db.getSiblingDB('" << config.databaseName << "');\n";
    ofs << script;
    ofs.close();

    string targetDbUri = config.uri;
    size_t qPos = targetDbUri.find('?');
    if (qPos == string::npos) {
        if (!targetDbUri.empty() && targetDbUri.back() != '/') {
            targetDbUri += '/';
        }
        targetDbUri += config.databaseName;
    } else {
        size_t slashBeforeQ = targetDbUri.rfind('/', qPos);
        if (slashBeforeQ != string::npos && slashBeforeQ + 1 == qPos) {
            targetDbUri.insert(qPos, config.databaseName);
        } else if (slashBeforeQ == string::npos) {
            targetDbUri.insert(qPos, "/" + config.databaseName);
        }
    }

    string cmd = "mongosh \"" + targetDbUri + "\" --quiet --file \"" + scriptPath + "\" 2>&1";

#if defined(_WIN32)
    FILE* pipe = _popen(cmd.c_str(), "r");
#else
    FILE* pipe = popen(cmd.c_str(), "r");
#endif
    if (!pipe) {
        outError = "Failed to spawn mongosh process.";
        lastError = outError;
        remove(scriptPath.c_str());
#if defined(_WIN32)
        remove(tempFile);
#endif
        return false;
    }

    char buffer[1024];
    string result;
    while (fgets(buffer, sizeof(buffer), pipe) != nullptr) {
        result += buffer;
    }

#if defined(_WIN32)
    int exitCode = _pclose(pipe);
    remove(tempFile);
#else
    int exitCode = pclose(pipe);
#endif
    remove(scriptPath.c_str());

    if (exitCode != 0) {
        outError = result;
        lastError = result;
        return false;
    }

    outOutput = result;
    return true;
}

bool DatabaseManager::ping() {
    string script = "print(JSON.stringify(db.runCommand({ping: 1})));";
    string out, err;
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
        cout << "[WARN] MongoDB unavailable at " << config.getSanitizedUri()
                  << ". Database manager initialized in disconnected state." << endl;
    } else {
        cout << "[INFO] Connected to MongoDB at " << config.getSanitizedUri()
                  << " (Database: " << config.databaseName << ")" << endl;
    }
    return connected;
}

bool DatabaseManager::isConnected() const {
    return connected;
}

string DatabaseManager::getLastError() const {
    return lastError;
}

bool DatabaseManager::savePatient(const Patient& patient) {
    if (!connected) return false;
    json doc = {
        {"patientId", patient.patientId},
        {"patientName", patient.name},
        {"age", patient.age},
        {"gender", patient.gender},
        {"phone", patient.phone}
    };
    string script = "db." + config.patientsCollection +
                         ".updateOne({patientId: " + to_string(patient.patientId) + "}, " +
                         "{$set: " + doc.dump() + "}, {upsert: true});\n";
    string out, err;
    return runMongoScript(script, out, err);
}

bool DatabaseManager::updatePatient(const Patient& patient) {
    return savePatient(patient);
}

bool DatabaseManager::loadAllPatients(vector<Patient>& outPatients) {
    if (!connected) return false;
    string script = "print(JSON.stringify(db." + config.patientsCollection +
                         ".find({}, {_id: 0}).sort({patientId: 1}).toArray()));\n";
    string out, err;
    if (!runMongoScript(script, out, err)) {
        return false;
    }
    try {
        auto arr = json::parse(out);
        outPatients.clear();
        for (const auto& item : arr) {
            Patient p;
            p.patientId = item.value("patientId", 0);
            p.name = item.value("patientName", item.value("name", ""));
            p.age = item.value("age", 0);
            p.gender = item.value("gender", "");
            p.phone = item.value("phone", "");
            if (p.patientId > 0) {
                outPatients.push_back(p);
            }
        }
        return true;
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::saveDoctor(const Doctor& doctor) {
    if (!connected) return false;
    json doc = {
        {"doctorId", doctor.doctorId},
        {"doctorName", doctor.name},
        {"specialization", doctor.specialization},
        {"roomNo", doctor.roomNo}
    };
    string script = "db." + config.doctorsCollection +
                         ".updateOne({doctorId: " + to_string(doctor.doctorId) + "}, " +
                         "{$set: " + doc.dump() + "}, {upsert: true});\n";
    string out, err;
    return runMongoScript(script, out, err);
}

bool DatabaseManager::loadAllDoctors(vector<Doctor>& outDoctors) {
    if (!connected) return false;
    string script = "print(JSON.stringify(db." + config.doctorsCollection +
                         ".find({}, {_id: 0}).sort({doctorId: 1}).toArray()));\n";
    string out, err;
    if (!runMongoScript(script, out, err)) {
        return false;
    }
    try {
        auto arr = json::parse(out);
        outDoctors.clear();
        for (const auto& item : arr) {
            Doctor d;
            d.doctorId = item.value("doctorId", 0);
            d.name = item.value("doctorName", item.value("name", ""));
            d.specialization = item.value("specialization", "");
            d.roomNo = item.value("roomNo", 0);
            if (d.doctorId > 0) {
                outDoctors.push_back(d);
            }
        }
        return true;
    } catch (...) {
        return false;
    }
}

bool DatabaseManager::saveConsultation(const Registration& reg) {
    if (!connected) return false;
    json doc = {
        {"tokenNo", reg.tokenNo},
        {"patientId", reg.patientId},
        {"patientName", reg.patientName},
        {"doctorId", reg.doctorId},
        {"doctorName", reg.doctorName},
        {"roomNo", reg.roomNo},
        {"healthIssue", reg.healthIssue},
        {"emergency", reg.emergency},
        {"status", reg.status},
        {"createdAt", reg.createdAt},
        {"updatedAt", reg.updatedAt}
    };
    string script = "db." + config.consultationsCollection +
                         ".updateOne({tokenNo: " + to_string(reg.tokenNo) + "}, " +
                         "{$set: " + doc.dump() + "}, {upsert: true});\n";
    string out, err;
    return runMongoScript(script, out, err);
}

bool DatabaseManager::updateConsultationStatus(int tokenNo, const string& status) {
    if (!connected) return false;
    string ts = getCurrentTimestamp();
    string script = "db." + config.consultationsCollection +
                         ".updateOne({tokenNo: " + to_string(tokenNo) + "}, " +
                         "{$set: {status: '" + status + "', updatedAt: '" + ts + "'}});\n";
    string out, err;
    return runMongoScript(script, out, err);
}

bool DatabaseManager::loadAllConsultations(vector<Registration>& outConsultations) {
    if (!connected) return false;
    string script = "print(JSON.stringify(db." + config.consultationsCollection +
                         ".find({}, {_id: 0}).sort({tokenNo: 1}).toArray()));\n";
    string out, err;
    if (!runMongoScript(script, out, err)) {
        return false;
    }
    try {
        auto arr = json::parse(out);
        outConsultations.clear();
        for (const auto& item : arr) {
            Registration r;
            r.tokenNo = item.value("tokenNo", 0);
            r.patientId = item.value("patientId", 0);
            r.patientName = item.value("patientName", "");
            r.doctorId = item.value("doctorId", 0);
            r.doctorName = item.value("doctorName", "");
            r.roomNo = item.value("roomNo", 0);
            r.healthIssue = item.value("healthIssue", "");
            r.emergency = item.value("emergency", false);
            r.status = item.value("status", "Waiting");
            r.createdAt = item.value("createdAt", "");
            r.updatedAt = item.value("updatedAt", "");
            if (r.tokenNo > 0) {
                outConsultations.push_back(r);
            }
        }
        return true;
    } catch (...) {
        return false;
    }
}