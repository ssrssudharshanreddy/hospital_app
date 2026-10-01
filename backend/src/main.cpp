#include "db_config.h"
#include "database_manager.h"
#include "hospital_dsa.h"
#include "server.h"
#include <iostream>
#include <cstring>
#include <cstdlib>
using namespace std;

#ifdef _WIN32
#define EXPORT_API extern "C" __declspec(dllexport)
#else
#define EXPORT_API extern "C"
#endif

EXPORT_API int run_backend_server(int port = 8080) {
    cout << "=======================================================" << endl;
    cout << "  Hospital Patient Queue Management System - C++ Core  " << endl;
    cout << "  Academic Data Structures & Algorithms Implementation " << endl;
    cout << "=======================================================" << endl;

    MongoConfig dbConfig;
    DatabaseManager dbManager;
    bool dbConnected = dbManager.initialize(dbConfig);

    HospitalDSA hospitalDSA;

    if (dbConnected) {
        cout << "[INFO] Recovering system state from MongoDB Atlas..." << endl;

        vector<Doctor> docs;
        if (dbManager.loadAllDoctors(docs) && !docs.empty()) {
            for (const auto& d : docs) {
                hospitalDSA.loadDoctor(d);
            }
            cout << "[INFO] Recovered " << docs.size() << " doctors." << endl;
        }

        vector<Patient> pats;
        if (dbManager.loadAllPatients(pats)) {
            for (const auto& p : pats) {
                hospitalDSA.loadPatient(p);
            }
            cout << "[INFO] Recovered " << pats.size() << " patients." << endl;
        }

        vector<Registration> consults;
        if (dbManager.loadAllConsultations(consults)) {
            for (const auto& c : consults) {
                hospitalDSA.loadConsultation(c);
            }
            cout << "[INFO] Recovered " << consults.size() << " consultations ("
                      << hospitalDSA.getTotalWaitingCount() << " active waiting in queues)." << endl;
        }
    } else {
        cout << "[WARN] Running in in-memory mode (MongoDB not connected)." << endl;
    }

    if (hospitalDSA.getDoctorCount() == 0) {
        Doctor d1(1, "Dr. Sarah Johnson", "Cardiology", 101);
        Doctor d2(2, "Dr. Michael Chen", "Orthopedics", 102);
        Doctor d3(3, "Dr. Emily Rodriguez", "Pediatrics", 103);
        Doctor d4(4, "Dr. James Wilson", "Neurology", 104);
        Doctor d5(5, "Dr. Lisa Anderson", "General Medicine", 105);

        hospitalDSA.addDoctor(d1);
        hospitalDSA.addDoctor(d2);
        hospitalDSA.addDoctor(d3);
        hospitalDSA.addDoctor(d4);
        hospitalDSA.addDoctor(d5);

        if (dbConnected) {
            dbManager.saveDoctor(d1);
            dbManager.saveDoctor(d2);
            dbManager.saveDoctor(d3);
            dbManager.saveDoctor(d4);
            dbManager.saveDoctor(d5);
        }
        cout << "[INFO] Seeded default 5 doctors into system." << endl;
    }

    string host = "0.0.0.0";
    ApiServer server(port, host, hospitalDSA, dbManager);

    cout << "[INFO] Server ready at http://localhost:" << port << endl;
    if (!server.start()) {
        cerr << "[ERROR] Failed to start server on port " << port << endl;
        return 1;
    }

    return 0;
}

int main(int argc, char* argv[]) {
    int port = 8080;
    if (argc > 1) {
        port = atoi(argv[1]);
    } else {
        const char* envPort = getenv("PORT");
        if (envPort && strlen(envPort) > 0) {
            int p = atoi(envPort);
            if (p > 0) {
                port = p;
            }
        }
    }

    if (port <= 0) {
        port = 8080;
    }

    return run_backend_server(port);
}