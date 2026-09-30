#ifndef SYSTEM_RECOVERY_H
#define SYSTEM_RECOVERY_H

#include "db/database_manager.h"
#include "core/patient_manager.h"
#include "core/doctor_manager.h"
#include "core/token_manager.h"
#include "core/queue_manager.h"
#include "core/consultation_manager.h"
#include <string>

// ==============================================================
// SystemRecovery: Startup Recovery & Queue Reconstruction Engine
// Recovers in-memory C++ state from persistent MongoDB storage
// As specified in Document 1, 4, 5 (Phase 5)
// ==============================================================

class SystemRecovery {
public:
    static bool recoverSystemState(IDatabaseManager& db,
                                  PatientManager& pm,
                                  DoctorManager& dm,
                                  TokenManager& tm,
                                  QueueManager& qm,
                                  ConsultationManager& cm,
                                  std::string& outSummary);
};

#endif // SYSTEM_RECOVERY_H
