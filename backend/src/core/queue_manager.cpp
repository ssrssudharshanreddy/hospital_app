#include "core/queue_manager.h"
#include <iostream>
#include <sstream>
#include <iomanip>

static std::string formatTokenNumber(int token) {
    std::ostringstream oss;
    oss << std::setw(3) << std::setfill('0') << token;
    return oss.str();
}

void QueueManager::addToEmergencyQueue(const QueueRegistration& reg) {
    emergencyQueues[reg.doctorId].push(reg);
}

void QueueManager::addToNormalQueue(const QueueRegistration& reg) {
    normalQueues[reg.doctorId].push(reg);
}

bool QueueManager::hasEmergencyPatients(int doctorId) const {
    auto it = emergencyQueues.find(doctorId);
    return (it != emergencyQueues.end() && !it->second.empty());
}

bool QueueManager::hasWaitingPatients(int doctorId) const {
    if (hasEmergencyPatients(doctorId)) return true;
    auto it = normalQueues.find(doctorId);
    return (it != normalQueues.end() && !it->second.empty());
}

bool QueueManager::getNextPatient(int doctorId, QueueRegistration& outPatient) const {
    // 1. Peek at Emergency Queue front if non-empty
    auto itEmg = emergencyQueues.find(doctorId);
    if (itEmg != emergencyQueues.end() && !itEmg->second.empty()) {
        outPatient = itEmg->second.front();
        return true;
    }

    // 2. Peek at Normal Queue front if emergency queue is empty
    auto itNorm = normalQueues.find(doctorId);
    if (itNorm != normalQueues.end() && !itNorm->second.empty()) {
        outPatient = itNorm->second.front();
        return true;
    }

    // 3. Both queues empty
    return false;
}

bool QueueManager::processNextPatient(int doctorId, QueueRegistration& outPatient) {
    // Academic DSA Priority Rule:
    // If emergency queue is not empty:
    //     process emergency queue front
    // Otherwise:
    //     process normal queue front

    // 1. Check emergency queue first
    auto itEmg = emergencyQueues.find(doctorId);
    if (itEmg != emergencyQueues.end() && !itEmg->second.empty()) {
        outPatient = itEmg->second.front();
        itEmg->second.pop();
        return true;
    }

    // 2. Normal queue only processed when emergency queue is empty
    auto itNorm = normalQueues.find(doctorId);
    if (itNorm != normalQueues.end() && !itNorm->second.empty()) {
        outPatient = itNorm->second.front();
        itNorm->second.pop();
        return true;
    }

    // 3. Both queues are empty
    return false;
}

int QueueManager::countEmergencyWaiting(int doctorId) const {
    auto it = emergencyQueues.find(doctorId);
    return (it != emergencyQueues.end()) ? static_cast<int>(it->second.size()) : 0;
}

int QueueManager::countNormalWaiting(int doctorId) const {
    auto it = normalQueues.find(doctorId);
    return (it != normalQueues.end()) ? static_cast<int>(it->second.size()) : 0;
}

int QueueManager::countWaitingPatients(int doctorId) const {
    return countEmergencyWaiting(doctorId) + countNormalWaiting(doctorId);
}

int QueueManager::countTotalWaiting(int doctorId) const {
    return countWaitingPatients(doctorId);
}

std::string QueueManager::getEmergencyQueueString(int doctorId) const {
    auto list = getEmergencyQueueSnapshot(doctorId);
    if (list.empty()) return "[Empty]";

    std::ostringstream oss;
    for (size_t i = 0; i < list.size(); ++i) {
        oss << "[" << formatTokenNumber(list[i].tokenNo) << "]";
        if (i + 1 < list.size()) oss << " -> ";
    }
    return oss.str();
}

std::string QueueManager::getNormalQueueString(int doctorId) const {
    auto list = getNormalQueueSnapshot(doctorId);
    if (list.empty()) return "[Empty]";

    std::ostringstream oss;
    for (size_t i = 0; i < list.size(); ++i) {
        oss << "[" << formatTokenNumber(list[i].tokenNo) << "]";
        if (i + 1 < list.size()) oss << " -> ";
    }
    return oss.str();
}

std::string QueueManager::getProcessingOrderString(int doctorId) const {
    auto emgList = getEmergencyQueueSnapshot(doctorId);
    auto normList = getNormalQueueSnapshot(doctorId);

    if (emgList.empty() && normList.empty()) return "[None]";

    std::ostringstream oss;
    bool first = true;
    for (const auto& q : emgList) {
        if (!first) oss << " -> ";
        oss << "[" << formatTokenNumber(q.tokenNo) << " (Emergency)]";
        first = false;
    }
    for (const auto& q : normList) {
        if (!first) oss << " -> ";
        oss << "[" << formatTokenNumber(q.tokenNo) << " (Normal)]";
        first = false;
    }
    return oss.str();
}

void QueueManager::displayEmergencyQueue(int doctorId) const {
    std::cout << "Doctor " << doctorId << " Emergency Queue: "
              << getEmergencyQueueString(doctorId)
              << " (Count: " << countEmergencyWaiting(doctorId) << ")" << std::endl;
}

void QueueManager::displayNormalQueue(int doctorId) const {
    std::cout << "Doctor " << doctorId << " Normal Queue: "
              << getNormalQueueString(doctorId)
              << " (Count: " << countNormalWaiting(doctorId) << ")" << std::endl;
}

void QueueManager::displayDoctorQueues(int doctorId) const {
    std::cout << "=======================================================" << std::endl;
    std::cout << "  Doctor " << doctorId << " Queue Overview" << std::endl;
    std::cout << "=======================================================" << std::endl;
    displayEmergencyQueue(doctorId);
    displayNormalQueue(doctorId);
    std::cout << "Effective Processing Order: " << getProcessingOrderString(doctorId) << std::endl;
    std::cout << "Total Waiting: " << countWaitingPatients(doctorId) << std::endl;
    std::cout << "-------------------------------------------------------" << std::endl;
}

std::vector<QueueRegistration> QueueManager::getEmergencyQueueSnapshot(int doctorId) const {
    std::vector<QueueRegistration> list;
    auto it = emergencyQueues.find(doctorId);
    if (it != emergencyQueues.end()) {
        std::queue<QueueRegistration> copy = it->second;
        while (!copy.empty()) {
            list.push_back(copy.front());
            copy.pop();
        }
    }
    return list;
}

std::vector<QueueRegistration> QueueManager::getNormalQueueSnapshot(int doctorId) const {
    std::vector<QueueRegistration> list;
    auto it = normalQueues.find(doctorId);
    if (it != normalQueues.end()) {
        std::queue<QueueRegistration> copy = it->second;
        while (!copy.empty()) {
            list.push_back(copy.front());
            copy.pop();
        }
    }
    return list;
}

bool QueueManager::removeFromQueue(int doctorId, int tokenNo, bool emergency) {
    if (emergency) {
        auto it = emergencyQueues.find(doctorId);
        if (it == emergencyQueues.end() || it->second.empty()) return false;

        std::queue<QueueRegistration> temp;
        bool found = false;
        while (!it->second.empty()) {
            QueueRegistration curr = it->second.front();
            it->second.pop();
            if (curr.tokenNo == tokenNo) {
                found = true;
            } else {
                temp.push(curr);
            }
        }
        it->second = temp;
        return found;
    } else {
        auto it = normalQueues.find(doctorId);
        if (it == normalQueues.end() || it->second.empty()) return false;

        std::queue<QueueRegistration> temp;
        bool found = false;
        while (!it->second.empty()) {
            QueueRegistration curr = it->second.front();
            it->second.pop();
            if (curr.tokenNo == tokenNo) {
                found = true;
            } else {
                temp.push(curr);
            }
        }
        it->second = temp;
        return found;
    }
}

bool QueueManager::isPatientWaiting(int patientId, int& outTokenNo, int& outDoctorId) const {
    for (const auto& pair : emergencyQueues) {
        std::queue<QueueRegistration> copy = pair.second;
        while (!copy.empty()) {
            if (copy.front().patientId == patientId) {
                outTokenNo = copy.front().tokenNo;
                outDoctorId = pair.first;
                return true;
            }
            copy.pop();
        }
    }
    for (const auto& pair : normalQueues) {
        std::queue<QueueRegistration> copy = pair.second;
        while (!copy.empty()) {
            if (copy.front().patientId == patientId) {
                outTokenNo = copy.front().tokenNo;
                outDoctorId = pair.first;
                return true;
            }
            copy.pop();
        }
    }
    return false;
}

void QueueManager::clearDoctorQueues(int doctorId) {
    auto itEmg = emergencyQueues.find(doctorId);
    if (itEmg != emergencyQueues.end()) {
        std::queue<QueueRegistration> emptyQueue;
        std::swap(itEmg->second, emptyQueue);
    }
    auto itNorm = normalQueues.find(doctorId);
    if (itNorm != normalQueues.end()) {
        std::queue<QueueRegistration> emptyQueue;
        std::swap(itNorm->second, emptyQueue);
    }
}

void QueueManager::clearAllQueues() {
    emergencyQueues.clear();
    normalQueues.clear();
}
