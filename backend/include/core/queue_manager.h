#ifndef QUEUE_MANAGER_H
#define QUEUE_MANAGER_H

#include "models/structures.h"
#include <map>
#include <queue>
#include <vector>
#include <string>

// ==============================================================
// QueueManager: Academic Core DSA Implementation
// Uses separate FIFO emergency and normal queues for each doctor
// ==============================================================

class QueueManager {
private:
    // Locked DSA architecture: Key is doctorId
    // Each doctor has an independent emergency queue and normal queue
    std::map<int, std::queue<QueueRegistration>> emergencyQueues;
    std::map<int, std::queue<QueueRegistration>> normalQueues;

public:
    QueueManager() = default;

    // 1. Queue Insertion
    void addToEmergencyQueue(const QueueRegistration& reg);
    void addToNormalQueue(const QueueRegistration& reg);

    // 2. Queue Inspection & Peeking (determine next patient without removing)
    bool hasEmergencyPatients(int doctorId) const;
    bool hasWaitingPatients(int doctorId) const;
    bool getNextPatient(int doctorId, QueueRegistration& outPatient) const;

    // 3. Queue Processing (removes next patient following priority rule)
    // Rule: If emergency queue is not empty, process emergency queue front;
    //       Otherwise, process normal queue front.
    bool processNextPatient(int doctorId, QueueRegistration& outPatient);

    // 4. Queue Waiting Counts
    int countEmergencyWaiting(int doctorId) const;
    int countNormalWaiting(int doctorId) const;
    int countWaitingPatients(int doctorId) const;
    int countTotalWaiting(int doctorId) const; // Alias for countWaitingPatients

    // 5. Queue Display & String Formatting
    void displayEmergencyQueue(int doctorId) const;
    void displayNormalQueue(int doctorId) const;
    void displayDoctorQueues(int doctorId) const;

    std::string getEmergencyQueueString(int doctorId) const;
    std::string getNormalQueueString(int doctorId) const;
    std::string getProcessingOrderString(int doctorId) const;

    // 6. Queue Snapshots (for inspection and API views without modifying queues)
    std::vector<QueueRegistration> getEmergencyQueueSnapshot(int doctorId) const;
    std::vector<QueueRegistration> getNormalQueueSnapshot(int doctorId) const;

    // 7. Queue Maintenance (reconstruction on cancellation or doctor transfer)
    bool removeFromQueue(int doctorId, int tokenNo, bool emergency);

    // 8. In-queue search (check if a patient is currently waiting in any doctor's queue)
    bool isPatientWaiting(int patientId, int& outTokenNo, int& outDoctorId) const;

    // 9. Reset / Cleansing (for test isolation)
    void clearDoctorQueues(int doctorId);
    void clearAllQueues();
};

#endif // QUEUE_MANAGER_H
