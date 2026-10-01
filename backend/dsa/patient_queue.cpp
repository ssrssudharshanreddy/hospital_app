#include "patient_queue.h"
using namespace std;

PatientQueue::PatientQueue() : front(0), rear(-1), itemCount(0) {}

bool PatientQueue::isEmpty() const {
    return itemCount == 0;
}

bool PatientQueue::isFull() const {
    return itemCount == MAX_QUEUE_SIZE;
}

bool PatientQueue::enqueue(const Registration& reg) {
    if (isFull()) {
        return false;
    }
    rear = (rear + 1) % MAX_QUEUE_SIZE;
    data[rear] = reg;
    itemCount++;
    return true;
}

bool PatientQueue::enqueueFront(const Registration& reg) {
    if (isFull()) {
        return false;
    }
    if (isEmpty()) {
        rear = 0;
        front = 0;
        data[0] = reg;
        itemCount = 1;
        return true;
    }
    front = (front - 1 + MAX_QUEUE_SIZE) % MAX_QUEUE_SIZE;
    data[front] = reg;
    itemCount++;
    return true;
}

bool PatientQueue::dequeue(Registration& outReg) {
    if (isEmpty()) {
        return false;
    }
    outReg = data[front];
    front = (front + 1) % MAX_QUEUE_SIZE;
    itemCount--;
    if (itemCount == 0) {
        front = 0;
        rear = -1;
    }
    return true;
}

bool PatientQueue::peek(Registration& outReg) const {
    if (isEmpty()) {
        return false;
    }
    outReg = data[front];
    return true;
}

int PatientQueue::count() const {
    return itemCount;
}

Registration PatientQueue::getAt(int index) const {
    if (index < 0 || index >= itemCount) {
        return Registration();
    }
    int actualIndex = (front + index) % MAX_QUEUE_SIZE;
    return data[actualIndex];
}

bool PatientQueue::updateToken(int tokenNo, const Registration& updatedReg) {
    for (int i = 0; i < itemCount; ++i) {
        int idx = (front + i) % MAX_QUEUE_SIZE;
        if (data[idx].tokenNo == tokenNo) {
            data[idx] = updatedReg;
            return true;
        }
    }
    return false;
}

bool PatientQueue::cancelToken(int tokenNo) {
    int targetLogicalIndex = -1;
    for (int i = 0; i < itemCount; ++i) {
        int idx = (front + i) % MAX_QUEUE_SIZE;
        if (data[idx].tokenNo == tokenNo) {
            targetLogicalIndex = i;
            break;
        }
    }

    if (targetLogicalIndex == -1) {
        return false;
    }

    for (int i = targetLogicalIndex; i < itemCount - 1; ++i) {
        int currIdx = (front + i) % MAX_QUEUE_SIZE;
        int nextIdx = (front + i + 1) % MAX_QUEUE_SIZE;
        data[currIdx] = data[nextIdx];
    }

    rear = (rear - 1 + MAX_QUEUE_SIZE) % MAX_QUEUE_SIZE;
    itemCount--;
    if (itemCount == 0) {
        front = 0;
        rear = -1;
    }
    return true;
}

void PatientQueue::clear() {
    front = 0;
    rear = -1;
    itemCount = 0;
}