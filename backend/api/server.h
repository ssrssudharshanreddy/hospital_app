#ifndef API_SERVER_H
#define API_SERVER_H

#include "hospital_dsa.h"
#include "database_manager.h"
#include <string>
#include <memory>
using namespace std;

namespace httplib {
    class Server;
}

class ApiServer {
private:
    int port;
    string host;
    unique_ptr<httplib::Server> server;

    HospitalDSA& dsa;
    DatabaseManager& db;

    void registerRoutes();

public:
    ApiServer(int port, const string& host, HospitalDSA& dsa, DatabaseManager& db);
    ~ApiServer();

    bool start();
    void stop();
    bool isRunning() const;
    int getPort() const { return port; }
    string getHost() const { return host; }
};

#endif