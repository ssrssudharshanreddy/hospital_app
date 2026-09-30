#ifndef STRUCTURES_H
#define STRUCTURES_H

#include <string>

// ==========================================
// Core Locked Data Structures (DSA Engine)
// As specified in Document 1 & Document 2
// ==========================================

struct Patient {
    int patientId;
    std::string patientName;
    int age;
    std::string gender;
    std::string phone;

    Patient() : patientId(0), age(0) {}
    Patient(int id, const std::string& pName, int a, const std::string& g, const std::string& p)
        : patientId(id), patientName(pName), age(a), gender(g), phone(p) {}
};

struct Doctor {
    int doctorId;
    std::string doctorName;
    std::string specialization;
    int roomNo;

    Doctor() : doctorId(0), roomNo(0) {}
    Doctor(int id, const std::string& name, const std::string& spec, int room)
        : doctorId(id), doctorName(name), specialization(spec), roomNo(room) {}
};

struct QueueRegistration {
    int tokenNo;
    int patientId;
    std::string healthIssue;
    int doctorId;
    bool emergency;

    QueueRegistration() : tokenNo(0), patientId(0), doctorId(0), emergency(false) {}
    QueueRegistration(int token, int pId, const std::string& issue, int dId, bool emg)
        : tokenNo(token), patientId(pId), healthIssue(issue), doctorId(dId), emergency(emg) {}
};

// ==============================================================
// Persistent / API Record Structure (Kept Separate from DSA Core)
// Required for MongoDB storage and REST API communication
// ==============================================================

struct ConsultationRecord {
    int tokenNo;
    int patientId;
    std::string patientName;
    int doctorId;
    std::string doctorName;
    int roomNo;
    std::string healthIssue;
    bool emergency;
    std::string status; // "Waiting", "Completed", "Cancelled"
    std::string createdAt;
    std::string updatedAt;

    ConsultationRecord()
        : tokenNo(0), patientId(0), doctorId(0), roomNo(0),
          emergency(false), status("Waiting") {}
};

#endif // STRUCTURES_H
