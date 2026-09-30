#ifndef DOCTOR_MANAGER_H
#define DOCTOR_MANAGER_H

#include "models/structures.h"
#include <unordered_map>
#include <vector>
#include <string>

// Forward declaration
class IDatabaseManager;

// ==============================================================
// DoctorManager: Doctor Management Core Implementation
// As specified in Document 1 & Document 2 (Phase 4 & 5)
// ==============================================================

class DoctorManager {
private:
    // Key: doctorId, Value: Doctor
    std::unordered_map<int, Doctor> doctorMap;
    IDatabaseManager* dbManager;

public:
    DoctorManager() : dbManager(nullptr) {}

    void setDatabaseManager(IDatabaseManager* db) { dbManager = db; }
    IDatabaseManager* getDatabaseManager() const { return dbManager; }

    // 1. Doctor Registration & Addition
    bool addDoctor(const Doctor& doctor, std::string& errorMsg);
    bool addDoctor(const Doctor& doctor); // Convenience overload

    // 2. Doctor Lookup & Retrieval
    bool getDoctorById(int doctorId, Doctor& outDoctor) const;
    std::vector<Doctor> getAllDoctors() const;

    // 3. Validation & Existence Checks
    bool doctorExists(int doctorId) const;
    bool validateDoctor(const Doctor& doctor, std::string& errorMsg) const;

    // 4. Formatting & Display
    std::string formatDoctor(const Doctor& doctor) const;
    void displayDoctor(int doctorId) const;
    void displayAllDoctors() const;

    // 5. Seed Data & Management
    void seedInitialDoctors();
    void loadDoctors(const std::vector<Doctor>& doctors);
    void clearAllDoctors();
    size_t getDoctorCount() const;
};

#endif // DOCTOR_MANAGER_H
