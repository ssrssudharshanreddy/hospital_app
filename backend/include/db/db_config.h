#ifndef DB_CONFIG_H
#define DB_CONFIG_H

#include <string>
#include <cstdlib>
#include <fstream>
#include <vector>

struct MongoConfig {
    std::string uri;
    std::string databaseName;
    std::string patientsCollection;
    std::string doctorsCollection;
    std::string consultationsCollection;

    static std::string trim(const std::string& str) {
        size_t first = str.find_first_not_of(" \t\r\n\"'");
        if (first == std::string::npos) return "";
        size_t last = str.find_last_not_of(" \t\r\n\"'");
        return str.substr(first, (last - first + 1));
    }

    static void loadEnvFile(std::string& outUri, std::string& outDb) {
        const std::vector<std::string> searchPaths = {
            ".env",
            "../.env",
            "../../.env",
            "../../../.env"
        };
        for (const auto& path : searchPaths) {
            std::ifstream file(path);
            if (file.is_open()) {
                std::string line;
                while (std::getline(file, line)) {
                    std::string trimmed = trim(line);
                    if (trimmed.empty() || trimmed[0] == '#') continue;
                    size_t eqPos = trimmed.find('=');
                    if (eqPos != std::string::npos) {
                        std::string key = trim(trimmed.substr(0, eqPos));
                        std::string val = trim(trimmed.substr(eqPos + 1));
                        if (key == "MONGODB_URI" && outUri.empty()) {
                            outUri = val;
                        } else if (key == "MONGODB_DB_NAME" && outDb.empty()) {
                            outDb = val;
                        }
                    }
                }
                file.close();
                if (!outUri.empty() || !outDb.empty()) {
                    break;
                }
            }
        }
    }

    std::string getSanitizedUri() const {
        size_t schemePos = uri.find("://");
        if (schemePos == std::string::npos) return uri;
        size_t atPos = uri.find('@', schemePos + 3);
        if (atPos == std::string::npos) return uri;

        size_t colonPos = uri.find(':', schemePos + 3);
        if (colonPos != std::string::npos && colonPos < atPos) {
            std::string user = uri.substr(schemePos + 3, colonPos - (schemePos + 3));
            return uri.substr(0, schemePos + 3) + user + ":***" + uri.substr(atPos);
        } else {
            return uri.substr(0, schemePos + 3) + "***" + uri.substr(atPos);
        }
    }

    MongoConfig() {
        const char* envUri = std::getenv("MONGODB_URI");
        const char* envDb = std::getenv("MONGODB_DB_NAME");

        std::string loadedUri = (envUri && std::string(envUri).length() > 0) ? envUri : "";
        std::string loadedDb = (envDb && std::string(envDb).length() > 0) ? envDb : "";

        // If not provided directly via environment variables, attempt loading from .env
        if (loadedUri.empty() || loadedDb.empty()) {
            loadEnvFile(loadedUri, loadedDb);
        }

        // Fallback to local MongoDB defaults if still not provided
        uri = !loadedUri.empty() ? loadedUri : "mongodb://localhost:27017";
        databaseName = !loadedDb.empty() ? loadedDb : "hospital_queue_db";

        patientsCollection = "patients";
        doctorsCollection = "doctors";
        consultationsCollection = "consultations";
    }
};

#endif // DB_CONFIG_H
