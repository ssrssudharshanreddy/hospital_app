#ifndef STRUCTURES_H
#define STRUCTURES_H

#include <string>
using namespace std;

struct Patient {
    int patientId;
    string name;
    int age;
    string gender;
    string phone;

    Patient() : patientId(0), age(0) {}
    Patient(int id, const string& n, int a, const string& g, const string& p)
        : patientId(id), name(n), age(a), gender(g), phone(p) {}
};

struct Doctor {
    int doctorId;
    string name;
    string specialization;
    int roomNo;

    Doctor() : doctorId(0), roomNo(0) {}
    Doctor(int id, const string& n, const string& s, int r)
        : doctorId(id), name(n), specialization(s), roomNo(r) {}
};

struct Registration {
    int tokenNo;
    int patientId;
    string patientName;
    int doctorId;
    string doctorName;
    int roomNo;
    string healthIssue;
    bool emergency;
    string status;
    string createdAt;
    string updatedAt;

    Registration()
        : tokenNo(0), patientId(0), doctorId(0), roomNo(0),
          emergency(false), status("Waiting") {}
};

#endif