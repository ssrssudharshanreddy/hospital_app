#include "third_party/httplib.h"
#include "third_party/json.hpp"
#include "api/server.h"
#include "utils/logger.h"
#include <iostream>

using json = nlohmann::json;

// ==============================================================
// Serialization & HTTP Response Helpers
// ==============================================================

static void sendJson(httplib::Response& res, int statusCode, const json& data) {
    res.status = statusCode;
    res.set_content(data.dump(), "application/json");
}

static void sendSuccess(httplib::Response& res, const json& data, int statusCode = 200, const std::string& message = "") {
    json body = {{"success", true}};
    if (!message.empty()) body["message"] = message;
    body["data"] = data;
    sendJson(res, statusCode, body);
}

static void sendError(httplib::Response& res, int statusCode, const std::string& errorMessage) {
    json body = {
        {"success", false},
        {"error", errorMessage}
    };
    sendJson(res, statusCode, body);
}

static json patientToJson(const Patient& p) {
    return {
        {"patientId", p.patientId},
        {"patientName", p.patientName},
        {"age", p.age},
        {"gender", p.gender},
        {"phone", p.phone}
    };
}

static json doctorToJson(const Doctor& d) {
    return {
        {"doctorId", d.doctorId},
        {"doctorName", d.doctorName},
        {"specialization", d.specialization},
        {"roomNo", d.roomNo}
    };
}

static json queueRegistrationToJson(const QueueRegistration& q) {
    return {
        {"tokenNo", q.tokenNo},
        {"formattedToken", TokenManager::formatToken(q.tokenNo)},
        {"patientId", q.patientId},
        {"healthIssue", q.healthIssue},
        {"doctorId", q.doctorId},
        {"emergency", q.emergency}
    };
}

static json consultationRecordToJson(const ConsultationRecord& c) {
    return {
        {"tokenNo", c.tokenNo},
        {"formattedToken", TokenManager::formatToken(c.tokenNo)},
        {"patientId", c.patientId},
        {"patientName", c.patientName},
        {"doctorId", c.doctorId},
        {"doctorName", c.doctorName},
        {"roomNo", c.roomNo},
        {"healthIssue", c.healthIssue},
        {"emergency", c.emergency},
        {"status", c.status},
        {"createdAt", c.createdAt},
        {"updatedAt", c.updatedAt}
    };
}

// ==============================================================
// ApiServer Implementation
// ==============================================================

ApiServer::ApiServer(int p, const std::string& h,
                     QueueManager& qm, PatientManager& pm, DoctorManager& dm,
                     ConsultationManager& cm, TokenManager& tm, IDatabaseManager& db)
    : port(p), host(h), server(std::make_unique<httplib::Server>()),
      queueManager(qm), patientManager(pm), doctorManager(dm),
      consultationManager(cm), tokenManager(tm), dbManager(db) {
    registerRoutes();
}

ApiServer::~ApiServer() {
    stop();
}

void ApiServer::registerRoutes() {
    // -------------------------------------------------------------
    // CORS Support for React + Vite Frontend (http://localhost:5173)
    // -------------------------------------------------------------
    server->set_pre_routing_handler([](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
        if (req.method == "OPTIONS") {
            res.status = 204;
            return httplib::Server::HandlerResponse::Handled;
        }
        return httplib::Server::HandlerResponse::Unhandled;
    });

    server->set_error_handler([](const httplib::Request&, httplib::Response& res) {
        if (res.status == 404) {
            sendError(res, 404, "Endpoint not found.");
        }
    });

    // -------------------------------------------------------------
    // 1. Health & Status Endpoints
    // -------------------------------------------------------------
    server->Get("/api/health", [](const httplib::Request&, httplib::Response& res) {
        json data = {
            {"status", "UP"},
            {"service", "Hospital Patient Queue Management System - C++ Backend"},
            {"version", "1.0.0"}
        };
        sendSuccess(res, data, 200, "Service is healthy");
    });

    server->Get("/api/status", [this](const httplib::Request&, httplib::Response& res) {
        json data = {
            {"backendStatus", "running"},
            {"databaseConnected", dbManager.isConnected()},
            {"activeDoctors", doctorManager.getDoctorCount()},
            {"totalPatients", patientManager.countPatients()},
            {"waitingConsultations", consultationManager.countWaitingConsultations()},
            {"completedConsultations", consultationManager.countCompletedConsultations()},
            {"cancelledConsultations", consultationManager.countCancelledConsultations()},
            {"nextToken", tokenManager.getNextToken()},
            {"formattedNextToken", TokenManager::formatToken(tokenManager.getNextToken())}
        };
        sendSuccess(res, data, 200);
    });

    // -------------------------------------------------------------
    // 2. Patient Endpoints
    // -------------------------------------------------------------
    server->Post("/api/patients", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string name = body.value("patientName", "");
            int age = body.value("age", 0);
            std::string gender = body.value("gender", "");
            std::string phone = body.value("phone", "");

            Patient outPat;
            std::string err;
            bool ok = patientManager.registerPatient(name, age, gender, phone, outPat, err);
            if (!ok) {
                if (err.find("already registered") != std::string::npos) {
                    sendError(res, 409, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }
            sendSuccess(res, patientToJson(outPat), 201, "Patient registered successfully");
        } catch (const std::exception& e) {
            sendError(res, 400, std::string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Get("/api/patients", [this](const httplib::Request&, httplib::Response& res) {
        auto list = patientManager.getAllPatients();
        json arr = json::array();
        for (const auto& p : list) arr.push_back(patientToJson(p));
        json data = {{"count", list.size()}, {"patients", arr}};
        sendSuccess(res, data, 200);
    });

    // Register search route before regex numeric ID route
    server->Get("/api/patients/search", [this](const httplib::Request& req, httplib::Response& res) {
        if (!req.has_param("phone")) {
            sendError(res, 400, "Missing required query parameter 'phone'.");
            return;
        }
        std::string phone = req.get_param_value("phone");
        Patient p;
        if (!patientManager.findPatientByPhone(phone, p)) {
            sendError(res, 404, "No patient found with phone number " + phone + ".");
            return;
        }
        sendSuccess(res, patientToJson(p), 200);
    });

    server->Get(R"(/api/patients/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        Patient p;
        if (!patientManager.findPatientById(id, p)) {
            sendError(res, 404, "Patient ID " + std::to_string(id) + " not found.");
            return;
        }
        sendSuccess(res, patientToJson(p), 200);
    });

    server->Put(R"(/api/patients/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        try {
            auto body = json::parse(req.body);
            std::string name = body.value("patientName", "");
            int age = body.value("age", 0);
            std::string gender = body.value("gender", "");
            std::string phone = body.value("phone", "");

            std::string err;
            bool ok = patientManager.updatePatient(id, name, age, gender, phone, err);
            if (!ok) {
                if (err.find("not found") != std::string::npos) {
                    sendError(res, 404, err);
                } else if (err.find("already registered") != std::string::npos) {
                    sendError(res, 409, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }
            Patient updated;
            patientManager.findPatientById(id, updated);
            sendSuccess(res, patientToJson(updated), 200, "Patient updated successfully");
        } catch (const std::exception& e) {
            sendError(res, 400, std::string("Invalid JSON payload: ") + e.what());
        }
    });

    // -------------------------------------------------------------
    // 3. Doctor Endpoints
    // -------------------------------------------------------------
    server->Get("/api/doctors", [this](const httplib::Request&, httplib::Response& res) {
        auto list = doctorManager.getAllDoctors();
        json arr = json::array();
        for (const auto& d : list) arr.push_back(doctorToJson(d));
        json data = {{"count", list.size()}, {"doctors", arr}};
        sendSuccess(res, data, 200);
    });

    server->Get(R"(/api/doctors/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        Doctor d;
        if (!doctorManager.getDoctorById(id, d)) {
            sendError(res, 404, "Doctor ID " + std::to_string(id) + " not found.");
            return;
        }
        sendSuccess(res, doctorToJson(d), 200);
    });

    server->Post("/api/doctors", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int id = body.value("doctorId", 0);
            std::string name = body.value("doctorName", "");
            std::string spec = body.value("specialization", "");
            int room = body.value("roomNo", 0);

            Doctor doc(id, name, spec, room);
            std::string err;
            bool ok = doctorManager.addDoctor(doc, err);
            if (!ok) {
                if (err.find("already exists") != std::string::npos) {
                    sendError(res, 409, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }
            sendSuccess(res, doctorToJson(doc), 201, "Doctor registered successfully");
        } catch (const std::exception& e) {
            sendError(res, 400, std::string("Invalid JSON payload: ") + e.what());
        }
    });

    // -------------------------------------------------------------
    // 4. Consultation Endpoints
    // -------------------------------------------------------------
    server->Post("/api/consultations", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int pId = body.value("patientId", 0);
            std::string issue = body.value("healthIssue", "");
            int dId = body.value("doctorId", 0);
            bool emg = body.value("emergency", false);

            ConsultationRecord outRecord;
            std::string err;
            bool ok = consultationManager.registerConsultation(pId, issue, dId, emg, outRecord, err);
            if (!ok) {
                if (err.find("already has an active") != std::string::npos) {
                    sendError(res, 409, err);
                } else if (err.find("Patient ID") != std::string::npos && err.find("not found") != std::string::npos) {
                    sendError(res, 404, err);
                } else if (err.find("Doctor ID") != std::string::npos && err.find("not found") != std::string::npos) {
                    sendError(res, 404, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }
            sendSuccess(res, consultationRecordToJson(outRecord), 201, "Consultation registered successfully");
        } catch (const std::exception& e) {
            sendError(res, 400, std::string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Get("/api/consultations", [this](const httplib::Request& req, httplib::Response& res) {
        auto all = consultationManager.getAllConsultations();
        std::string statusFilter = req.has_param("status") ? req.get_param_value("status") : "";
        int docFilter = req.has_param("doctorId") ? std::stoi(req.get_param_value("doctorId")) : 0;
        int patFilter = req.has_param("patientId") ? std::stoi(req.get_param_value("patientId")) : 0;

        json arr = json::array();
        for (const auto& c : all) {
            if (!statusFilter.empty() && c.status != statusFilter) continue;
            if (docFilter != 0 && c.doctorId != docFilter) continue;
            if (patFilter != 0 && c.patientId != patFilter) continue;
            arr.push_back(consultationRecordToJson(c));
        }
        json data = {{"count", arr.size()}, {"consultations", arr}};
        sendSuccess(res, data, 200);
    });

    server->Get(R"(/api/consultations/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int token = std::stoi(req.matches[1]);
        ConsultationRecord rec;
        if (!consultationManager.findConsultationByToken(token, rec)) {
            sendError(res, 404, "Consultation with token " + TokenManager::formatToken(token) + " not found.");
            return;
        }
        sendSuccess(res, consultationRecordToJson(rec), 200);
    });

    server->Put(R"(/api/consultations/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int token = std::stoi(req.matches[1]);
        try {
            auto body = json::parse(req.body);
            int newDocId = body.contains("doctorId") ? body["doctorId"].get<int>() :
                          (body.contains("newDoctorId") ? body["newDoctorId"].get<int>() : 0);
            bool newEmg = body.contains("emergency") ? body["emergency"].get<bool>() :
                         (body.contains("newEmergency") ? body["newEmergency"].get<bool>() : false);
            std::string newIssue = body.contains("healthIssue") ? body["healthIssue"].get<std::string>() :
                                  (body.contains("newHealthIssue") ? body["newHealthIssue"].get<std::string>() : "");

            std::string err;
            bool ok = consultationManager.updateConsultation(token, newDocId, newEmg, newIssue, err);
            if (!ok) {
                if (err.find("not found") != std::string::npos) {
                    sendError(res, 404, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }
            ConsultationRecord updated;
            consultationManager.findConsultationByToken(token, updated);
            sendSuccess(res, consultationRecordToJson(updated), 200, "Consultation updated successfully");
        } catch (const std::exception& e) {
            sendError(res, 400, std::string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Post(R"(/api/consultations/(\d+)/cancel)", [this](const httplib::Request& req, httplib::Response& res) {
        int token = std::stoi(req.matches[1]);
        std::string err;
        bool ok = consultationManager.cancelConsultation(token, err);
        if (!ok) {
            if (err.find("not found") != std::string::npos) {
                sendError(res, 404, err);
            } else {
                sendError(res, 400, err);
            }
            return;
        }
        ConsultationRecord rec;
        consultationManager.findConsultationByToken(token, rec);
        json data = {
            {"tokenNo", token},
            {"formattedToken", TokenManager::formatToken(token)},
            {"status", "Cancelled"},
            {"patientId", rec.patientId},
            {"patientName", rec.patientName}
        };
        sendSuccess(res, data, 200, "Consultation cancelled successfully");
    });

    // -------------------------------------------------------------
    // 5. Queue Endpoints
    // -------------------------------------------------------------
    server->Get(R"(/api/queues/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int doctorId = std::stoi(req.matches[1]);
        Doctor doc;
        if (!doctorManager.getDoctorById(doctorId, doc)) {
            sendError(res, 404, "Doctor ID " + std::to_string(doctorId) + " not found.");
            return;
        }

        auto emgList = queueManager.getEmergencyQueueSnapshot(doctorId);
        auto normList = queueManager.getNormalQueueSnapshot(doctorId);

        json emgArr = json::array();
        for (const auto& q : emgList) emgArr.push_back(queueRegistrationToJson(q));

        json normArr = json::array();
        for (const auto& q : normList) normArr.push_back(queueRegistrationToJson(q));

        QueueRegistration nextPat;
        bool hasNext = queueManager.getNextPatient(doctorId, nextPat);

        json data = {
            {"doctor", doctorToJson(doc)},
            {"emergencyWaiting", queueManager.countEmergencyWaiting(doctorId)},
            {"normalWaiting", queueManager.countNormalWaiting(doctorId)},
            {"totalWaiting", queueManager.countTotalWaiting(doctorId)},
            {"hasNextPatient", hasNext},
            {"effectiveProcessingOrder", queueManager.getProcessingOrderString(doctorId)},
            {"emergencyQueue", emgArr},
            {"normalQueue", normArr}
        };

        if (hasNext) {
            data["nextPatient"] = queueRegistrationToJson(nextPat);
        }

        sendSuccess(res, data, 200);
    });

    server->Post(R"(/api/queues/(\d+)/process)", [this](const httplib::Request& req, httplib::Response& res) {
        int doctorId = std::stoi(req.matches[1]);
        Doctor doc;
        if (!doctorManager.getDoctorById(doctorId, doc)) {
            sendError(res, 404, "Doctor ID " + std::to_string(doctorId) + " not found.");
            return;
        }

        ConsultationRecord processedRecord;
        std::string err;
        bool ok = consultationManager.processNextPatient(doctorId, processedRecord, err);
        if (!ok) {
            sendError(res, 400, err);
            return;
        }

        sendSuccess(res, consultationRecordToJson(processedRecord), 200, "Patient processed successfully");
    });

    // -------------------------------------------------------------
    // 6. Dashboard Statistics Endpoint
    // -------------------------------------------------------------
    server->Get("/api/dashboard/stats", [this](const httplib::Request&, httplib::Response& res) {
        int totalEmgWaiting = 0;
        int totalNormWaiting = 0;
        auto doctors = doctorManager.getAllDoctors();

        json docSummaries = json::array();
        for (const auto& d : doctors) {
            int emg = queueManager.countEmergencyWaiting(d.doctorId);
            int norm = queueManager.countNormalWaiting(d.doctorId);
            totalEmgWaiting += emg;
            totalNormWaiting += norm;

            QueueRegistration np;
            bool hasNext = queueManager.getNextPatient(d.doctorId, np);

            json dSummary = {
                {"doctorId", d.doctorId},
                {"doctorName", d.doctorName},
                {"specialization", d.specialization},
                {"roomNo", d.roomNo},
                {"emergencyWaiting", emg},
                {"normalWaiting", norm},
                {"totalWaiting", emg + norm},
                {"hasNextPatient", hasNext}
            };
            if (hasNext) {
                dSummary["nextPatientToken"] = np.tokenNo;
                dSummary["formattedNextToken"] = TokenManager::formatToken(np.tokenNo);
                dSummary["isNextEmergency"] = np.emergency;
            }
            docSummaries.push_back(dSummary);
        }

        json data = {
            {"totalWaiting", totalEmgWaiting + totalNormWaiting},
            {"emergencyWaiting", totalEmgWaiting},
            {"normalWaiting", totalNormWaiting},
            {"doctorCount", doctors.size()},
            {"patientCount", patientManager.countPatients()},
            {"totalConsultations", consultationManager.countTotalConsultations()},
            {"completedConsultations", consultationManager.countCompletedConsultations()},
            {"cancelledConsultations", consultationManager.countCancelledConsultations()},
            {"nextToken", tokenManager.getNextToken()},
            {"formattedNextToken", TokenManager::formatToken(tokenManager.getNextToken())},
            {"doctorQueueSummary", docSummaries}
        };
        sendSuccess(res, data, 200);
    });
}

bool ApiServer::start() {
    Logger::info("Starting C++ REST API Server on " + host + ":" + std::to_string(port) + "...");
    return server->listen(host, port);
}

void ApiServer::stop() {
    if (server && server->is_running()) {
        Logger::info("Stopping C++ REST API Server...");
        server->stop();
    }
}

bool ApiServer::isRunning() const {
    return server && server->is_running();
}
