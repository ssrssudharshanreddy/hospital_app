#include "core/patient_manager.h"
#include "utils/validation.h"
#include "db/database_manager.h"

int PatientManager::generatePatientId() {
    return nextPatientId++;
}

int PatientManager::getNextPatientId() const {
    return nextPatientId;
}

void PatientManager::setNextPatientId(int val) {
    if (val >= 101) {
        nextPatientId = val;
    }
}

bool PatientManager::registerPatient(const std::string& patientName, int age, const std::string& gender,
                                     const std::string& phone, Patient& outPatient, std::string& errorMsg) {
    // 1. Validate Patient Name
    if (!Validation::isNonEmpty(patientName)) {
        errorMsg = "Patient name cannot be empty.";
        return false;
    }

    // 2. Validate Age (1 to 120)
    if (!Validation::isValidAge(age)) {
        errorMsg = "Invalid age. Age must be between 1 and 120.";
        return false;
    }

    // 3. Validate Gender (Male / Female / Other)
    if (!Validation::isValidGender(gender)) {
        errorMsg = "Invalid gender. Please specify Male, Female, or Other.";
        return false;
    }

    // 4. Validate Phone Number (10 digits)
    if (!Validation::isValidPhone(phone)) {
        errorMsg = "Invalid phone number. Must be a 10-digit number.";
        return false;
    }

    // 5. Duplicate Phone Number Check
    auto itPhone = phoneIndex.find(phone);
    if (itPhone != phoneIndex.end()) {
        errorMsg = "A patient is already registered with phone number " + phone +
                   " (Patient ID: " + std::to_string(itPhone->second) + ").";
        return false;
    }

    // 6. Generate unique, permanent Patient ID
    int id = generatePatientId();
    outPatient = Patient(id, patientName, age, gender, phone);
    patientMap[id] = outPatient;
    phoneIndex[phone] = id;

    if (dbManager && dbManager->isConnected()) {
        dbManager->savePatient(outPatient);
    }
    return true;
}

bool PatientManager::findPatientById(int patientId, Patient& outPatient) const {
    auto it = patientMap.find(patientId);
    if (it != patientMap.end()) {
        outPatient = it->second;
        return true;
    }
    return false;
}

bool PatientManager::findPatientByPhone(const std::string& phone, Patient& outPatient) const {
    auto it = phoneIndex.find(phone);
    if (it != phoneIndex.end()) {
        return findPatientById(it->second, outPatient);
    }
    return false;
}

bool PatientManager::patientExists(int patientId) const {
    return patientMap.find(patientId) != patientMap.end();
}

bool PatientManager::phoneExists(const std::string& phone) const {
    return phoneIndex.find(phone) != phoneIndex.end();
}

bool PatientManager::updatePatient(int patientId, const std::string& patientName, int age,
                                   const std::string& gender, const std::string& phone, std::string& errorMsg) {
    auto it = patientMap.find(patientId);
    if (it == patientMap.end()) {
        errorMsg = "Patient ID not found.";
        return false;
    }

    // Validate new details
    if (!Validation::isNonEmpty(patientName)) {
        errorMsg = "Patient name cannot be empty.";
        return false;
    }

    if (!Validation::isValidAge(age)) {
        errorMsg = "Invalid age. Age must be between 1 and 120.";
        return false;
    }

    if (!Validation::isValidGender(gender)) {
        errorMsg = "Invalid gender. Please specify Male, Female, or Other.";
        return false;
    }

    if (!Validation::isValidPhone(phone)) {
        errorMsg = "Invalid phone number. Must be a 10-digit number.";
        return false;
    }

    // Check if phone changed and belongs to another patient
    if (it->second.phone != phone) {
        auto itPhone = phoneIndex.find(phone);
        if (itPhone != phoneIndex.end() && itPhone->second != patientId) {
            errorMsg = "Another patient is already registered with phone number " + phone +
                       " (Patient ID: " + std::to_string(itPhone->second) + ").";
            return false;
        }
        phoneIndex.erase(it->second.phone);
        phoneIndex[phone] = patientId;
    }

    // Patient ID remains strictly untouched and permanent
    it->second.patientName = patientName;
    it->second.age = age;
    it->second.gender = gender;
    it->second.phone = phone;

    if (dbManager && dbManager->isConnected()) {
        dbManager->updatePatient(it->second);
    }
    return true;
}

std::vector<Patient> PatientManager::getAllPatients() const {
    std::vector<Patient> list;
    for (const auto& pair : patientMap) {
        list.push_back(pair.second);
    }
    return list;
}

int PatientManager::countPatients() const {
    return static_cast<int>(patientMap.size());
}

void PatientManager::loadPatients(const std::vector<Patient>& patients) {
    for (const auto& p : patients) {
        patientMap[p.patientId] = p;
        phoneIndex[p.phone] = p.patientId;
        if (p.patientId >= nextPatientId) {
            nextPatientId = p.patientId + 1;
        }
    }
}

void PatientManager::clearAllPatients() {
    patientMap.clear();
    phoneIndex.clear();
    nextPatientId = 101;
}
