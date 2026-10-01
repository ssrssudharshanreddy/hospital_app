#ifndef DB_CONFIG_H
#define DB_CONFIG_H

#include <string>
#include <cstdlib>
#include <fstream>
#include <vector>
using namespace std;

struct MongoConfig {
    string uri;
    string databaseName;
    string patientsCollection;
    string doctorsCollection;
    string consultationsCollection;

    static string trim(const string& str) {
        size_t first = str.find_first_not_of(" \t\r\n\"'");
        if (first == string::npos) return "";
        size_t last = str.find_last_not_of(" \t\r\n\"'");
        return str.substr(first, (last - first + 1));
    }

    static void loadEnvFile(string& outUri, string& outDb) {
        const vector<string> searchPaths = {
            ".env",
            "../.env",
            "../../.env",
            "../../../.env"
        };
        for (const auto& path : searchPaths) {
            ifstream file(path);
            if (file.is_open()) {
                string line;
                while (getline(file, line)) {
                    string trimmed = trim(line);
                    if (trimmed.empty() || trimmed[0] == '#') continue;
                    size_t eqPos = trimmed.find('=');
                    if (eqPos != string::npos) {
                        string key = trim(trimmed.substr(0, eqPos));
                        string val = trim(trimmed.substr(eqPos + 1));
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

    string getSanitizedUri() const {
        size_t schemePos = uri.find("://");
        if (schemePos == string::npos) return uri;
        size_t atPos = uri.find('@', schemePos + 3);
        if (atPos == string::npos) return uri;

        size_t colonPos = uri.find(':', schemePos + 3);
        if (colonPos != string::npos && colonPos < atPos) {
            string user = uri.substr(schemePos + 3, colonPos - (schemePos + 3));
            return uri.substr(0, schemePos + 3) + user + ":***" + uri.substr(atPos);
        } else {
            return uri.substr(0, schemePos + 3) + "***" + uri.substr(atPos);
        }
    }

    MongoConfig() {
        const char* envUri = getenv("MONGODB_URI");
        const char* envDb = getenv("MONGODB_DB_NAME");

        string loadedUri = (envUri && string(envUri).length() > 0) ? envUri : "";
        string loadedDb = (envDb && string(envDb).length() > 0) ? envDb : "";

        if (loadedUri.empty() || loadedDb.empty()) {
            loadEnvFile(loadedUri, loadedDb);
        }

        uri = !loadedUri.empty() ? loadedUri : "mongodb://localhost:27017";
        databaseName = !loadedDb.empty() ? loadedDb : "hospital_queue_db";

        patientsCollection = "patients";
        doctorsCollection = "doctors";
        consultationsCollection = "consultations";
    }
};

#endif