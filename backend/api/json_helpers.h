#ifndef JSON_HELPERS_H
#define JSON_HELPERS_H

#include "structures.h"
#include "third_party/httplib.h"
#include "third_party/json.hpp"
#include <string>
#include <sstream>
#include <iomanip>
using namespace std;

inline string formatToken(int tokenNo) {
    ostringstream oss;
    oss << setw(3) << setfill('0') << tokenNo;
    return oss.str();
}

inline void sendJson(httplib::Response& res, int statusCode, const nlohmann::json& data) {
    res.status = statusCode;
    res.set_content(data.dump(), "application/json");
}

inline void sendSuccess(httplib::Response& res, const nlohmann::json& data, int statusCode = 200, const string& message = "") {
    nlohmann::json body = {{"success", true}};
    if (!message.empty()) {
        body["message"] = message;
    }
    body["data"] = data;
    sendJson(res, statusCode, body);
}

inline void sendError(httplib::Response& res, int statusCode, const string& errorMessage) {
    nlohmann::json body = {
        {"success", false},
        {"error", errorMessage}
    };
    sendJson(res, statusCode, body);
}

inline nlohmann::json patientToJson(const Patient& p) {
    return {
        {"patientId", p.patientId},
        {"patientName", p.name},
        {"age", p.age},
        {"gender", p.gender},
        {"phone", p.phone}
    };
}

inline nlohmann::json doctorToJson(const Doctor& d) {
    return {
        {"doctorId", d.doctorId},
        {"doctorName", d.name},
        {"specialization", d.specialization},
        {"roomNo", d.roomNo}
    };
}

inline nlohmann::json registrationToJson(const Registration& r) {
    return {
        {"tokenNo", r.tokenNo},
        {"formattedToken", formatToken(r.tokenNo)},
        {"patientId", r.patientId},
        {"patientName", r.patientName},
        {"doctorId", r.doctorId},
        {"doctorName", r.doctorName},
        {"roomNo", r.roomNo},
        {"healthIssue", r.healthIssue},
        {"emergency", r.emergency},
        {"status", r.status},
        {"createdAt", r.createdAt},
        {"updatedAt", r.updatedAt}
    };
}

inline nlohmann::json queueRegistrationToJson(const Registration& r) {
    return {
        {"tokenNo", r.tokenNo},
        {"formattedToken", formatToken(r.tokenNo)},
        {"patientId", r.patientId},
        {"patientName", r.patientName},
        {"healthIssue", r.healthIssue},
        {"doctorId", r.doctorId},
        {"doctorName", r.doctorName},
        {"roomNo", r.roomNo},
        {"emergency", r.emergency},
        {"status", r.status}
    };
}

#endif