#ifndef HOSPITAL_DSA_H
#define HOSPITAL_DSA_H

#include "structures.h"
#include "patient_queue.h"
#include <vector>
#include <string>
using namespace std;

const int MAX_DOCTORS = 10;

class HospitalDSA {
private:
    vector<Patient> patients;
    int nextPatientId;

    vector<Doctor> doctors;

    PatientQueue normalQueues[MAX_DOCTORS];
    PatientQueue emergencyQueues[MAX_DOCTORS];
    int nextTokenNumber;

    vector<Registration> consultationHistory;

    int getDoctorIndex(int doctorId) const;

public:
    HospitalDSA();

    bool registerPatient(const string& name, int age, const string& gender,
                         const string& phone, Patient& outPatient, string& errorMsg);

    int findPatientById(int patientId, Patient& outPatient) const;
    int findPatientByPhone(const string& phone, Patient& outPatient) const;

    bool updatePatient(int patientId, const string& name, int age,
                       const string& gender, const string& phone, string& errorMsg);

    bool bookConsultation(int patientId, int doctorId, const string& healthIssue,
                          bool isEmergency, Registration& outReg, string& errorMsg);

    bool processNextPatient(int doctorId, Registration& outProcessed, string& errorMsg);

    bool cancelConsultation(int tokenNo, string& errorMsg);
    bool findConsultationByToken(int tokenNo, Registration& outReg) const;
    bool updateConsultation(int tokenNo, int newDoctorId, bool newEmergency,
                            const string& newHealthIssue, string& errorMsg);

    vector<Registration> getWaitingList(int doctorId) const;
    vector<Registration> getEmergencyQueueSnapshot(int doctorId) const;
    vector<Registration> getNormalQueueSnapshot(int doctorId) const;
    bool getNextPatient(int doctorId, Registration& outNext) const;
    int getWaitingCount(int doctorId, bool emergencyOnly = false) const;
    int getTotalWaitingCount() const;
    int getEmergencyWaitingCount() const;
    int getNormalWaitingCount() const;
    int getCompletedCount() const;
    int getCancelledCount() const;
    int getTotalConsultationCount() const;

    bool addDoctor(const Doctor& doc, string& errorMsg);
    bool addDoctor(const Doctor& doc);
    bool findDoctorById(int doctorId, Doctor& outDoctor) const;
    const vector<Doctor>& getDoctors() const;
    const vector<Patient>& getPatients() const;
    const vector<Registration>& getAllConsultations() const;
    int getPatientCount() const;
    int getDoctorCount() const;
    int getNextTokenNumber() const;

    bool rollbackPatientRegistration(int patientId);
    bool rollbackDoctor(int doctorId);
    bool rollbackConsultation(int tokenNo);
    bool rollbackCancellation(int tokenNo);
    bool rollbackProcessing(const Registration& reg);

    void loadPatient(const Patient& patient);
    void loadDoctor(const Doctor& doctor);
    void loadConsultation(const Registration& reg);
    void reset();
};

#endif