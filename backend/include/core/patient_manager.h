#ifndef PATIENT_MANAGER_H
#define PATIENT_MANAGER_H

#include "models/structures.h"
#include <unordered_map>
#include <vector>
#include <string>

class IDatabaseManager;

class PatientManager {
private:
    int nextPatientId;
    std::unordered_map<int, Patient> patientMap;
    std::unordered_map<std::string, int> phoneIndex;
    IDatabaseManager* dbManager;

public:
    PatientManager() : nextPatientId(101), dbManager(nullptr) {}

    void setDatabaseManager(IDatabaseManager* db) { dbManager = db; }
    IDatabaseManager* getDatabaseManager() const { return dbManager; }

    // ID generation & sequencing
    int generatePatientId();
    int getNextPatientId() const;
    void setNextPatientId(int val);

    // Registration with comprehensive validation
    bool registerPatient(const std::string& patientName, int age, const std::string& gender,
                         const std::string& phone, Patient& outPatient, std::string& errorMsg);

    // Searching
    bool findPatientById(int patientId, Patient& outPatient) const;
    bool findPatientByPhone(const std::string& phone, Patient& outPatient) const;
    bool patientExists(int patientId) const;
    bool phoneExists(const std::string& phone) const;

    // Updating
    bool updatePatient(int patientId, const std::string& patientName, int age,
                       const std::string& gender, const std::string& phone, std::string& errorMsg);

    // Listing & state management
    std::vector<Patient> getAllPatients() const;
    int countPatients() const;
    void loadPatients(const std::vector<Patient>& patients);
    void clearAllPatients();
};

#endif // PATIENT_MANAGER_H
