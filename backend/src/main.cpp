#include "utils/logger.h"
#include "db/db_config.h"
#include "db/database_manager.h"
#include "core/queue_manager.h"
#include "core/patient_manager.h"
#include "core/doctor_manager.h"
#include "core/token_manager.h"
#include "core/consultation_manager.h"
#include "core/system_recovery.h"
#include "api/server.h"

#ifdef _WIN32
#define EXPORT_API extern "C" __declspec(dllexport)
#else
#define EXPORT_API extern "C"
#endif

EXPORT_API int run_backend_server(int port = 8080) {
    Logger::info("=======================================================");
    Logger::info("  Hospital Patient Queue Management System - C++ Core  ");
    Logger::info("=======================================================");

    // 1. Load DB Configuration (zero hardcoded credentials)
    MongoConfig dbConfig;
    DatabaseManager dbManager;
    bool dbConnected = dbManager.initialize(dbConfig);

    // 2. Initialize Core DSA and Manager Services
    QueueManager queueManager;
    PatientManager patientManager;
    DoctorManager doctorManager;
    TokenManager tokenManager;
    ConsultationManager consultationManager(queueManager, patientManager, doctorManager, tokenManager);

    if (dbConnected) {
        patientManager.setDatabaseManager(&dbManager);
        doctorManager.setDatabaseManager(&dbManager);
        consultationManager.setDatabaseManager(&dbManager);

        std::string recoverySummary;
        SystemRecovery::recoverSystemState(dbManager, patientManager, doctorManager,
                                           tokenManager, queueManager, consultationManager,
                                           recoverySummary);
        Logger::info("Database connected & state recovered: " + recoverySummary);
    } else {
        Logger::warn("Running in in-memory mode (MongoDB not connected).");
    }

    // 3. Seed initial doctors if empty
    if (doctorManager.getDoctorCount() == 0) {
        doctorManager.seedInitialDoctors();
        if (dbConnected) {
            for (const auto& doc : doctorManager.getAllDoctors()) {
                dbManager.saveDoctor(doc);
            }
        }
        Logger::info("Seeded initial doctors into system.");
    }

    // 4. Start REST API Server on port
    std::string host = "0.0.0.0";
    ApiServer server(port, host, queueManager, patientManager, doctorManager,
                      consultationManager, tokenManager, dbManager);

    Logger::info("Server ready at http://localhost:" + std::to_string(port));
    if (!server.start()) {
        Logger::error("Failed to start server on port " + std::to_string(port));
        return 1;
    }

    return 0;
}

int main(int argc, char* argv[]) {
    int port = 8080;
    if (argc > 1) {
        port = std::atoi(argv[1]);
        if (port <= 0) port = 8080;
    }
    return run_backend_server(port);
}
