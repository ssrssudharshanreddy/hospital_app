#include "core/token_manager.h"

std::string TokenManager::getSystemDateString() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::tm timeInfo;
#if defined(_WIN32)
    localtime_s(&timeInfo, &in_time_t);
#else
    localtime_r(&in_time_t, &timeInfo);
#endif
    std::ostringstream oss;
    oss << std::put_time(&timeInfo, "%Y-%m-%d");
    return oss.str();
}

TokenManager::TokenManager()
    : nextToken(1), currentDate(getSystemDateString()) {}

TokenManager::TokenManager(const std::string& initialDate)
    : nextToken(1), currentDate(initialDate) {}

int TokenManager::generateToken() {
    // Check if day has turned over in real time
    std::string today = getSystemDateString();
    if (today != currentDate) {
        currentDate = today;
        nextToken = 1;
    }
    return nextToken++;
}

std::string TokenManager::generateFormattedToken() {
    return formatToken(generateToken());
}

int TokenManager::getNextToken() const {
    return nextToken;
}

std::string TokenManager::getCurrentDate() const {
    return currentDate;
}

std::string TokenManager::formatToken(int token) {
    std::ostringstream oss;
    oss << std::setw(3) << std::setfill('0') << token;
    return oss.str();
}

bool TokenManager::isTokenIssued(int token) const {
    return token >= 1 && token < nextToken;
}

void TokenManager::setNextToken(int val) {
    if (val >= 1) {
        nextToken = val;
    }
}

void TokenManager::setCurrentDate(const std::string& date) {
    currentDate = date;
}

void TokenManager::resetForNewDay(const std::string& newDate) {
    currentDate = newDate;
    nextToken = 1;
}

void TokenManager::resetDailySequence() {
    nextToken = 1;
}

void TokenManager::recoverSequence(int highestExistingToken, const std::string& date) {
    // Used when recovering state on server restart
    if (date == currentDate) {
        if (highestExistingToken >= nextToken) {
            nextToken = highestExistingToken + 1;
        }
    } else if (date > currentDate) {
        currentDate = date;
        nextToken = highestExistingToken + 1;
    }
    // If date is an earlier day, keep today starting from 1 (or current sequence)
}
