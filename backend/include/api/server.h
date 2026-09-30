#ifndef SERVER_H
#define SERVER_H

#include "core/queue_manager.h"
#include "core/patient_manager.h"
#include "core/doctor_manager.h"
#include "core/consultation_manager.h"
#include "core/token_manager.h"
#include "db/database_manager.h"
#include <string>
#include <memory>

namespace httplib {
    class Server;
}

// ==============================================================
// ApiServer: C++ REST API Server
// Thin HTTP JSON adapter for C++ managers & queue engine
// As specified in Document 1, 3, 4, 5 (Phase 6)
// ==============================================================

class ApiServer {
private:
    int port;
    std::string host;
    std::unique_ptr<httplib::Server> server;

    QueueManager& queueManager;
    PatientManager& patientManager;
    DoctorManager& doctorManager;
    ConsultationManager& consultationManager;
    TokenManager& tokenManager;
    IDatabaseManager& dbManager;

    void registerRoutes();

public:
    ApiServer(int port, const std::string& host,
              QueueManager& qm, PatientManager& pm, DoctorManager& dm,
              ConsultationManager& cm, TokenManager& tm, IDatabaseManager& db);
    ~ApiServer();

    bool start();
    void stop();
    bool isRunning() const;
    int getPort() const { return port; }
    std::string getHost() const { return host; }
};

#endif // SERVER_H
