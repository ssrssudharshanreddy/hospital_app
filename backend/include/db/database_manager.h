#ifndef DATABASE_MANAGER_H
#define DATABASE_MANAGER_H

#include "models/structures.h"
#include "db/db_config.h"
#include <vector>
#include <string>
#include <memory>

// ==============================================================
// IDatabaseManager: MongoDB Database Abstraction Layer
// As specified in Document 1, Document 4 (Phase 5)
// ==============================================================

class IDatabaseManager {
public:
    virtual ~IDatabaseManager() = default;

    virtual bool initialize(const MongoConfig& config) = 0;
    virtual bool isConnected() const = 0;
    virtual std::string getLastError() const = 0;
    virtual bool ping() = 0;

    // Patient persistence
    virtual bool savePatient(const Patient& patient) = 0;
    virtual bool getPatientById(int id, Patient& outPatient) = 0;
    virtual bool getPatientByPhone(const std::string& phone, Patient& outPatient) = 0;
    virtual bool updatePatient(const Patient& patient) = 0;
    virtual std::vector<Patient> getAllPatients() = 0;
    virtual bool clearPatients() = 0;

    // Doctor persistence
    virtual bool saveDoctor(const Doctor& doctor) = 0;
    virtual bool getDoctorById(int id, Doctor& outDoctor) = 0;
    virtual std::vector<Doctor> getAllDoctors() = 0;
    virtual bool clearDoctors() = 0;

    // Consultation persistence
    virtual bool saveConsultation(const ConsultationRecord& record) = 0;
    virtual bool updateConsultationStatus(int tokenNo, const std::string& status) = 0;
    virtual bool updateConsultation(const ConsultationRecord& record) = 0;
    virtual bool getConsultationByToken(int tokenNo, ConsultationRecord& outRecord) = 0;
    virtual std::vector<ConsultationRecord> getAllConsultations() = 0;
    virtual std::vector<ConsultationRecord> getWaitingConsultations() = 0;
    virtual bool clearConsultations() = 0;

    // Maintenance / cleanup
    virtual bool clearAllData() = 0;
};

// ==============================================================
// DatabaseManager: MongoDB Shell (mongosh) Native Implementation
// Connects to local or remote MongoDB without heavy external SDKs
// ==============================================================

class DatabaseManager : public IDatabaseManager {
private:
    MongoConfig config;
    bool connected;
    std::string lastError;

    bool runMongoScript(const std::string& script, std::string& outOutput, std::string& outError);

public:
    DatabaseManager();
    ~DatabaseManager() override = default;

    bool initialize(const MongoConfig& cfg) override;
    bool isConnected() const override;
    std::string getLastError() const override;
    bool ping() override;

    // Patient persistence
    bool savePatient(const Patient& patient) override;
    bool getPatientById(int id, Patient& outPatient) override;
    bool getPatientByPhone(const std::string& phone, Patient& outPatient) override;
    bool updatePatient(const Patient& patient) override;
    std::vector<Patient> getAllPatients() override;
    bool clearPatients() override;

    // Doctor persistence
    bool saveDoctor(const Doctor& doctor) override;
    bool getDoctorById(int id, Doctor& outDoctor) override;
    std::vector<Doctor> getAllDoctors() override;
    bool clearDoctors() override;

    // Consultation persistence
    bool saveConsultation(const ConsultationRecord& record) override;
    bool updateConsultationStatus(int tokenNo, const std::string& status) override;
    bool updateConsultation(const ConsultationRecord& record) override;
    bool getConsultationByToken(int tokenNo, ConsultationRecord& outRecord) override;
    std::vector<ConsultationRecord> getAllConsultations() override;
    std::vector<ConsultationRecord> getWaitingConsultations() override;
    bool clearConsultations() override;

    // Maintenance / cleanup
    bool clearAllData() override;
};

#endif // DATABASE_MANAGER_H
