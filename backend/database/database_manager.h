#ifndef DATABASE_MANAGER_H
#define DATABASE_MANAGER_H

#include "structures.h"
#include "db_config.h"
#include <vector>
#include <string>
using namespace std;

class DatabaseManager {
private:
    MongoConfig config;
    bool connected;
    string lastError;

    bool runMongoScript(const string& script, string& outOutput, string& outError);

public:
    DatabaseManager();
    ~DatabaseManager() = default;

    bool initialize(const MongoConfig& cfg);
    bool isConnected() const;
    string getLastError() const;
    bool ping();

    bool savePatient(const Patient& patient);
    bool updatePatient(const Patient& patient);
    bool loadAllPatients(vector<Patient>& outPatients);

    bool saveDoctor(const Doctor& doctor);
    bool loadAllDoctors(vector<Doctor>& outDoctors);

    bool saveConsultation(const Registration& reg);
    bool updateConsultationStatus(int tokenNo, const string& status);
    bool loadAllConsultations(vector<Registration>& outConsultations);
};

#endif