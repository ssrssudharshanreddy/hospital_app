#include "core/doctor_manager.h"
#include "utils/validation.h"
#include "db/database_manager.h"
#include <iostream>
#include <iomanip>
#include <algorithm>

bool DoctorManager::validateDoctor(const Doctor& doctor, std::string& errorMsg) const {
    if (doctor.doctorId <= 0) {
        errorMsg = "Doctor ID must be a positive integer.";
        return false;
    }
    if (!Validation::isNonEmpty(doctor.doctorName)) {
        errorMsg = "Doctor name cannot be empty.";
        return false;
    }
    if (!Validation::isNonEmpty(doctor.specialization)) {
        errorMsg = "Doctor specialization cannot be empty.";
        return false;
    }
    if (doctor.roomNo <= 0) {
        errorMsg = "Room number must be a positive integer.";
        return false;
    }
    return true;
}

bool DoctorManager::addDoctor(const Doctor& doctor, std::string& errorMsg) {
    if (!validateDoctor(doctor, errorMsg)) {
        return false;
    }

    if (doctorMap.find(doctor.doctorId) != doctorMap.end()) {
        errorMsg = "Doctor ID " + std::to_string(doctor.doctorId) + " already exists. Doctor IDs must be unique.";
        return false;
    }

    doctorMap[doctor.doctorId] = doctor;
    if (dbManager && dbManager->isConnected()) {
        dbManager->saveDoctor(doctor);
    }
    return true;
}

bool DoctorManager::addDoctor(const Doctor& doctor) {
    std::string err;
    return addDoctor(doctor, err);
}

bool DoctorManager::getDoctorById(int doctorId, Doctor& outDoctor) const {
    auto it = doctorMap.find(doctorId);
    if (it != doctorMap.end()) {
        outDoctor = it->second;
        return true;
    }
    return false;
}

std::vector<Doctor> DoctorManager::getAllDoctors() const {
    std::vector<Doctor> list;
    list.reserve(doctorMap.size());
    for (const auto& pair : doctorMap) {
        list.push_back(pair.second);
    }
    std::sort(list.begin(), list.end(), [](const Doctor& a, const Doctor& b) {
        return a.doctorId < b.doctorId;
    });
    return list;
}

bool DoctorManager::doctorExists(int doctorId) const {
    return doctorMap.find(doctorId) != doctorMap.end();
}

std::string DoctorManager::formatDoctor(const Doctor& doctor) const {
    return "Doctor ID: " + std::to_string(doctor.doctorId) +
           " | Name: " + doctor.doctorName +
           " | Specialization: " + doctor.specialization +
           " | Room No: " + std::to_string(doctor.roomNo);
}

void DoctorManager::displayDoctor(int doctorId) const {
    Doctor doc;
    if (getDoctorById(doctorId, doc)) {
        std::cout << formatDoctor(doc) << std::endl;
    } else {
        std::cout << "Doctor with ID " << doctorId << " not found." << std::endl;
    }
}

void DoctorManager::displayAllDoctors() const {
    std::cout << "==========================================================================" << std::endl;
    std::cout << "                         REGISTERED DOCTORS LIST                          " << std::endl;
    std::cout << "==========================================================================" << std::endl;
    std::cout << std::left << std::setw(12) << "Doctor ID"
              << std::setw(25) << "Doctor Name"
              << std::setw(22) << "Specialization"
              << std::setw(10) << "Room No" << std::endl;
    std::cout << "--------------------------------------------------------------------------" << std::endl;

    std::vector<Doctor> doctors = getAllDoctors();
    for (const auto& d : doctors) {
        std::cout << std::left << std::setw(12) << d.doctorId
                  << std::setw(25) << d.doctorName
                  << std::setw(22) << d.specialization
                  << std::setw(10) << d.roomNo << std::endl;
    }
    std::cout << "==========================================================================" << std::endl;
}

void DoctorManager::seedInitialDoctors() {
    if (doctorMap.empty()) {
        std::string err;
        addDoctor(Doctor(201, "Dr. Kumar", "General Medicine", 204), err);
        addDoctor(Doctor(202, "Dr. Anjali Sharma", "Pediatrics", 108), err);
        addDoctor(Doctor(203, "Dr. Suresh Reddy", "Orthopedics", 302), err);
        addDoctor(Doctor(204, "Dr. Priya Patel", "Cardiology", 215), err);
    }
}

void DoctorManager::loadDoctors(const std::vector<Doctor>& doctors) {
    for (const auto& d : doctors) {
        doctorMap[d.doctorId] = d;
    }
}

void DoctorManager::clearAllDoctors() {
    doctorMap.clear();
}

size_t DoctorManager::getDoctorCount() const {
    return doctorMap.size();
}
