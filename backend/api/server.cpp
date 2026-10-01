#include "server.h"
#include "json_helpers.h"
#include <iostream>
using namespace std;

using json = nlohmann::json;

ApiServer::ApiServer(int p, const string& h, HospitalDSA& dsaRef, DatabaseManager& dbRef)
    : port(p), host(h), server(make_unique<httplib::Server>()), dsa(dsaRef), db(dbRef) {
    registerRoutes();
}

ApiServer::~ApiServer() {
    stop();
}

void ApiServer::registerRoutes() {

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
        if (res.status == 404 && res.body.empty()) {
            sendError(res, 404, "Endpoint not found.");
        }
    });

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
            {"databaseConnected", db.isConnected()},
            {"activeDoctors", dsa.getDoctorCount()},
            {"totalPatients", dsa.getPatientCount()},
            {"waitingConsultations", dsa.getTotalWaitingCount()},
            {"completedConsultations", dsa.getCompletedCount()},
            {"cancelledConsultations", dsa.getCancelledCount()},
            {"nextToken", dsa.getNextTokenNumber()},
            {"formattedNextToken", formatToken(dsa.getNextTokenNumber())}
        };
        sendSuccess(res, data, 200);
    });

    server->Post("/api/patients", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            string name = body.contains("patientName") ? body["patientName"].get<string>() :
                               (body.contains("name") ? body["name"].get<string>() : "");
            int age = body.value("age", 0);
            string gender = body.value("gender", "");
            string phone = body.value("phone", "");

            Patient outPat;
            string err;
            bool ok = dsa.registerPatient(name, age, gender, phone, outPat, err);
            if (!ok) {
                if (err.find("already registered") != string::npos) {
                    sendError(res, 409, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }

            if (db.isConnected()) {
                if (!db.savePatient(outPat)) {
                    dsa.rollbackPatientRegistration(outPat.patientId);
                    sendError(res, 500, "Failed to persist patient to database.");
                    return;
                }
            }

            sendSuccess(res, patientToJson(outPat), 201, "Patient registered successfully");
        } catch (const exception& e) {
            sendError(res, 400, string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Get("/api/patients", [this](const httplib::Request&, httplib::Response& res) {
        auto list = dsa.getPatients();
        json arr = json::array();
        for (const auto& p : list) {
            arr.push_back(patientToJson(p));
        }
        json data = {{"count", list.size()}, {"patients", arr}};
        sendSuccess(res, data, 200);
    });

    server->Get("/api/patients/search", [this](const httplib::Request& req, httplib::Response& res) {
        if (!req.has_param("phone")) {
            sendError(res, 400, "Missing required query parameter 'phone'.");
            return;
        }
        string phone = req.get_param_value("phone");
        Patient p;
        if (dsa.findPatientByPhone(phone, p) == -1) {
            sendError(res, 404, "No patient found with phone number " + phone + ".");
            return;
        }
        sendSuccess(res, patientToJson(p), 200);
    });

    server->Get(R"(/api/patients/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int id = stoi(req.matches[1]);
        Patient p;
        if (dsa.findPatientById(id, p) == -1) {
            sendError(res, 404, "Patient ID " + to_string(id) + " not found.");
            return;
        }
        sendSuccess(res, patientToJson(p), 200);
    });

    server->Put(R"(/api/patients/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int id = stoi(req.matches[1]);
        Patient oldPat;
        if (dsa.findPatientById(id, oldPat) == -1) {
            sendError(res, 404, "Patient ID " + to_string(id) + " not found.");
            return;
        }

        try {
            auto body = json::parse(req.body);
            string name = body.contains("patientName") ? body["patientName"].get<string>() :
                               (body.contains("name") ? body["name"].get<string>() : "");
            int age = body.value("age", 0);
            string gender = body.value("gender", "");
            string phone = body.value("phone", "");

            string err;
            bool ok = dsa.updatePatient(id, name, age, gender, phone, err);
            if (!ok) {
                if (err.find("not found") != string::npos) {
                    sendError(res, 404, err);
                } else if (err.find("already used") != string::npos) {
                    sendError(res, 409, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }

            Patient updated;
            dsa.findPatientById(id, updated);
            if (db.isConnected()) {
                if (!db.updatePatient(updated)) {
                    string dummy;
                    dsa.updatePatient(id, oldPat.name, oldPat.age, oldPat.gender, oldPat.phone, dummy);
                    sendError(res, 500, "Failed to persist patient update to database.");
                    return;
                }
            }

            sendSuccess(res, patientToJson(updated), 200, "Patient updated successfully");
        } catch (const exception& e) {
            sendError(res, 400, string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Get("/api/doctors", [this](const httplib::Request&, httplib::Response& res) {
        auto list = dsa.getDoctors();
        json arr = json::array();
        for (const auto& d : list) {
            arr.push_back(doctorToJson(d));
        }
        json data = {{"count", list.size()}, {"doctors", arr}};
        sendSuccess(res, data, 200);
    });

    server->Get(R"(/api/doctors/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int id = stoi(req.matches[1]);
        Doctor d;
        if (!dsa.findDoctorById(id, d)) {
            sendError(res, 404, "Doctor ID " + to_string(id) + " not found.");
            return;
        }
        sendSuccess(res, doctorToJson(d), 200);
    });

    server->Post("/api/doctors", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int id = body.value("doctorId", 0);
            string name = body.contains("doctorName") ? body["doctorName"].get<string>() :
                               (body.contains("name") ? body["name"].get<string>() : "");
            string spec = body.value("specialization", "");
            int room = body.value("roomNo", 0);

            Doctor doc(id, name, spec, room);
            string err;
            bool ok = dsa.addDoctor(doc, err);
            if (!ok) {
                if (err.find("already exists") != string::npos) {
                    sendError(res, 409, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }

            if (db.isConnected()) {
                if (!db.saveDoctor(doc)) {
                    dsa.rollbackDoctor(doc.doctorId);
                    sendError(res, 500, "Failed to persist doctor to database.");
                    return;
                }
            }

            sendSuccess(res, doctorToJson(doc), 201, "Doctor registered successfully");
        } catch (const exception& e) {
            sendError(res, 400, string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Post("/api/consultations", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int pId = body.value("patientId", 0);
            string issue = body.value("healthIssue", "");
            int dId = body.value("doctorId", 0);
            bool emg = body.value("emergency", false);

            Registration outRecord;
            string err;
            bool ok = dsa.bookConsultation(pId, dId, issue, emg, outRecord, err);
            if (!ok) {
                if (err.find("already has an active") != string::npos) {
                    sendError(res, 409, err);
                } else if (err.find("does not exist") != string::npos) {
                    sendError(res, 404, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }

            if (db.isConnected()) {
                if (!db.saveConsultation(outRecord)) {
                    dsa.rollbackConsultation(outRecord.tokenNo);
                    sendError(res, 500, "Failed to persist consultation to database.");
                    return;
                }
            }

            sendSuccess(res, registrationToJson(outRecord), 201, "Consultation registered successfully");
        } catch (const exception& e) {
            sendError(res, 400, string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Get("/api/consultations", [this](const httplib::Request& req, httplib::Response& res) {
        auto all = dsa.getAllConsultations();
        string statusFilter = req.has_param("status") ? req.get_param_value("status") : "";
        int docFilter = req.has_param("doctorId") ? stoi(req.get_param_value("doctorId")) : 0;
        int patFilter = req.has_param("patientId") ? stoi(req.get_param_value("patientId")) : 0;

        json arr = json::array();
        for (const auto& c : all) {
            if (!statusFilter.empty()) {
                bool match = (c.status == statusFilter);
                if (!match && (statusFilter == "IN_CONSULTATION" || statusFilter == "In Consultation")) {
                    match = (c.status == "In Consultation" || c.status == "IN_CONSULTATION");
                }
                if (!match) continue;
            }
            if (docFilter != 0 && c.doctorId != docFilter) continue;
            if (patFilter != 0 && c.patientId != patFilter) continue;
            arr.push_back(registrationToJson(c));
        }
        json data = {{"count", arr.size()}, {"consultations", arr}};
        sendSuccess(res, data, 200);
    });

    server->Get(R"(/api/consultations/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int token = stoi(req.matches[1]);
        Registration rec;
        if (!dsa.findConsultationByToken(token, rec)) {
            sendError(res, 404, "Consultation with token " + formatToken(token) + " not found.");
            return;
        }
        sendSuccess(res, registrationToJson(rec), 200);
    });

    server->Put(R"(/api/consultations/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int token = stoi(req.matches[1]);
        Registration oldReg;
        if (!dsa.findConsultationByToken(token, oldReg)) {
            sendError(res, 404, "Consultation record with Token #" + to_string(token) + " not found.");
            return;
        }

        try {
            auto body = json::parse(req.body);
            int newDocId = body.contains("doctorId") ? body["doctorId"].get<int>() :
                          (body.contains("newDoctorId") ? body["newDoctorId"].get<int>() : 0);
            bool newEmg = body.contains("emergency") ? body["emergency"].get<bool>() :
                         (body.contains("newEmergency") ? body["newEmergency"].get<bool>() : false);
            string newIssue = body.contains("healthIssue") ? body["healthIssue"].get<string>() :
                                  (body.contains("newHealthIssue") ? body["newHealthIssue"].get<string>() : "");

            string err;
            bool ok = dsa.updateConsultation(token, newDocId, newEmg, newIssue, err);
            if (!ok) {
                if (err.find("not found") != string::npos) {
                    sendError(res, 404, err);
                } else {
                    sendError(res, 400, err);
                }
                return;
            }

            Registration updated;
            dsa.findConsultationByToken(token, updated);
            if (db.isConnected()) {
                if (!db.saveConsultation(updated)) {
                    string dummy;
                    dsa.updateConsultation(token, oldReg.doctorId, oldReg.emergency, oldReg.healthIssue, dummy);
                    sendError(res, 500, "Failed to persist consultation update to database.");
                    return;
                }
            }

            sendSuccess(res, registrationToJson(updated), 200, "Consultation updated successfully");
        } catch (const exception& e) {
            sendError(res, 400, string("Invalid JSON payload: ") + e.what());
        }
    });

    server->Post(R"(/api/consultations/(\d+)/cancel)", [this](const httplib::Request& req, httplib::Response& res) {
        int token = stoi(req.matches[1]);
        Registration rec;
        if (!dsa.findConsultationByToken(token, rec)) {
            sendError(res, 404, "Consultation record with Token #" + to_string(token) + " not found.");
            return;
        }

        string err;
        bool ok = dsa.cancelConsultation(token, err);
        if (!ok) {
            sendError(res, 400, err);
            return;
        }

        if (db.isConnected()) {
            if (!db.updateConsultationStatus(token, "Cancelled")) {
                dsa.rollbackCancellation(token);
                sendError(res, 500, "Failed to persist cancellation to database.");
                return;
            }
        }

        json data = {
            {"tokenNo", token},
            {"formattedToken", formatToken(token)},
            {"status", "Cancelled"},
            {"patientId", rec.patientId},
            {"patientName", rec.patientName}
        };
        sendSuccess(res, data, 200, "Consultation cancelled successfully");
    });

    server->Post(R"(/api/consultations/(\d+)/complete)", [this](const httplib::Request& req, httplib::Response& res) {
        int token = stoi(req.matches[1]);
        Registration rec;
        if (!dsa.findConsultationByToken(token, rec)) {
            sendError(res, 404, "Consultation record with Token #" + to_string(token) + " not found.");
            return;
        }

        Registration completedRecord;
        string err;
        bool ok = dsa.completeConsultation(rec.doctorId, completedRecord, err);
        if (!ok) {
            sendError(res, 400, err);
            return;
        }

        if (db.isConnected()) {
            if (!db.updateConsultationStatus(completedRecord.tokenNo, "Completed")) {
                dsa.rollbackCompletion(completedRecord);
                sendError(res, 500, "Failed to persist completed status to database.");
                return;
            }
        }

        sendSuccess(res, registrationToJson(completedRecord), 200, "Consultation completed successfully");
    });

    server->Get(R"(/api/queues/(\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int doctorId = stoi(req.matches[1]);
        Doctor doc;
        if (!dsa.findDoctorById(doctorId, doc)) {
            sendError(res, 404, "Doctor ID " + to_string(doctorId) + " not found.");
            return;
        }

        auto emgList = dsa.getEmergencyQueueSnapshot(doctorId);
        auto normList = dsa.getNormalQueueSnapshot(doctorId);

        json emgArr = json::array();
        for (const auto& q : emgList) {
            emgArr.push_back(queueRegistrationToJson(q));
        }

        json normArr = json::array();
        for (const auto& q : normList) {
            normArr.push_back(queueRegistrationToJson(q));
        }

        Registration nextPat;
        bool hasNext = dsa.getNextPatient(doctorId, nextPat);

        Registration currentPat;
        bool hasCurrent = dsa.getCurrentConsultation(doctorId, currentPat);

        int emgWaiting = dsa.getWaitingCount(doctorId, true);
        int totalWaiting = dsa.getWaitingCount(doctorId, false);
        int normWaiting = totalWaiting - emgWaiting;

        json data = {
            {"doctor", doctorToJson(doc)},
            {"emergencyWaiting", emgWaiting},
            {"normalWaiting", normWaiting},
            {"totalWaiting", totalWaiting},
            {"hasNextPatient", hasNext},
            {"hasCurrentConsultation", hasCurrent},
            {"effectiveProcessingOrder", "Emergency Queue First (FIFO) -> Normal Queue (FIFO)"},
            {"emergencyQueue", emgArr},
            {"normalQueue", normArr}
        };

        if (hasCurrent) {
            data["currentConsultation"] = registrationToJson(currentPat);
        } else {
            data["currentConsultation"] = nullptr;
        }

        if (hasNext) {
            data["nextPatient"] = queueRegistrationToJson(nextPat);
        }

        sendSuccess(res, data, 200);
    });

    server->Post(R"(/api/queues/(\d+)/process)", [this](const httplib::Request& req, httplib::Response& res) {
        int doctorId = stoi(req.matches[1]);
        Doctor doc;
        if (!dsa.findDoctorById(doctorId, doc)) {
            sendError(res, 404, "Doctor ID " + to_string(doctorId) + " not found.");
            return;
        }

        Registration processedRecord;
        string err;
        bool ok = dsa.processNextPatient(doctorId, processedRecord, err);
        if (!ok) {
            sendError(res, 400, err);
            return;
        }

        if (db.isConnected()) {
            if (!db.updateConsultationStatus(processedRecord.tokenNo, "In Consultation")) {
                dsa.rollbackProcessing(processedRecord);
                sendError(res, 500, "Failed to persist consultation status to database.");
                return;
            }
        }

        sendSuccess(res, registrationToJson(processedRecord), 200, "Patient called into consultation successfully");
    });

    server->Post(R"(/api/queues/(\d+)/complete)", [this](const httplib::Request& req, httplib::Response& res) {
        int doctorId = stoi(req.matches[1]);
        Doctor doc;
        if (!dsa.findDoctorById(doctorId, doc)) {
            sendError(res, 404, "Doctor ID " + to_string(doctorId) + " not found.");
            return;
        }

        Registration completedRecord;
        string err;
        bool ok = dsa.completeConsultation(doctorId, completedRecord, err);
        if (!ok) {
            sendError(res, 400, err);
            return;
        }

        if (db.isConnected()) {
            if (!db.updateConsultationStatus(completedRecord.tokenNo, "Completed")) {
                dsa.rollbackCompletion(completedRecord);
                sendError(res, 500, "Failed to persist completed status to database.");
                return;
            }
        }

        sendSuccess(res, registrationToJson(completedRecord), 200, "Consultation completed successfully");
    });

    server->Get("/api/dashboard/stats", [this](const httplib::Request&, httplib::Response& res) {
        auto doctors = dsa.getDoctors();
        json docSummaries = json::array();

        for (const auto& d : doctors) {
            int emg = dsa.getWaitingCount(d.doctorId, true);
            int total = dsa.getWaitingCount(d.doctorId, false);
            int norm = total - emg;

            Registration np;
            bool hasNext = dsa.getNextPatient(d.doctorId, np);

            Registration curPat;
            bool hasCur = dsa.getCurrentConsultation(d.doctorId, curPat);

            json dSummary = {
                {"doctorId", d.doctorId},
                {"doctorName", d.name},
                {"specialization", d.specialization},
                {"roomNo", d.roomNo},
                {"emergencyWaiting", emg},
                {"normalWaiting", norm},
                {"totalWaiting", total},
                {"hasNextPatient", hasNext},
                {"hasCurrentConsultation", hasCur}
            };
            if (hasCur) {
                dSummary["currentPatientToken"] = curPat.tokenNo;
                dSummary["formattedCurrentToken"] = formatToken(curPat.tokenNo);
                dSummary["currentPatientName"] = curPat.patientName;
            }
            if (hasNext) {
                dSummary["nextPatientToken"] = np.tokenNo;
                dSummary["formattedNextToken"] = formatToken(np.tokenNo);
                dSummary["isNextEmergency"] = np.emergency;
            }
            docSummaries.push_back(dSummary);
        }

        json data = {
            {"totalWaiting", dsa.getTotalWaitingCount()},
            {"emergencyWaiting", dsa.getEmergencyWaitingCount()},
            {"normalWaiting", dsa.getNormalWaitingCount()},
            {"inConsultation", dsa.getInConsultationCount()},
            {"inConsultationCount", dsa.getInConsultationCount()},
            {"doctorCount", dsa.getDoctorCount()},
            {"patientCount", dsa.getPatientCount()},
            {"totalConsultations", dsa.getTotalConsultationCount()},
            {"completedConsultations", dsa.getCompletedCount()},
            {"cancelledConsultations", dsa.getCancelledCount()},
            {"nextToken", dsa.getNextTokenNumber()},
            {"formattedNextToken", formatToken(dsa.getNextTokenNumber())},
            {"doctorQueueSummary", docSummaries}
        };
        sendSuccess(res, data, 200);
    });
}

bool ApiServer::start() {
    cout << "[INFO] Starting C++ REST API Server on " << host << ":" << port << "..." << endl;
    return server->listen(host, port);
}

void ApiServer::stop() {
    if (server && server->is_running()) {
        cout << "[INFO] Stopping C++ REST API Server..." << endl;
        server->stop();
    }
}

bool ApiServer::isRunning() const {
    return server && server->is_running();
}