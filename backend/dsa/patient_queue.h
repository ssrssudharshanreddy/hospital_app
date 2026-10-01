#ifndef PATIENT_QUEUE_H
#define PATIENT_QUEUE_H

#include "structures.h"
using namespace std;

const int MAX_QUEUE_SIZE = 100;

class PatientQueue {
private:
    Registration data[MAX_QUEUE_SIZE];
    int front;
    int rear;
    int itemCount;

public:
    PatientQueue();

    bool isEmpty() const;
    bool isFull() const;

    bool enqueue(const Registration& reg);
    bool enqueueFront(const Registration& reg);
    bool dequeue(Registration& outReg);
    bool peek(Registration& outReg) const;

    int count() const;
    Registration getAt(int index) const;
    bool updateToken(int tokenNo, const Registration& updatedReg);
    bool cancelToken(int tokenNo);
    void clear();
};

#endif