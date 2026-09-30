#ifndef TOKEN_MANAGER_H
#define TOKEN_MANAGER_H

#include <string>
#include <iomanip>
#include <sstream>
#include <chrono>
#include <ctime>

class TokenManager {
private:
    int nextToken;
    std::string currentDate;

    static std::string getSystemDateString();

public:
    TokenManager();
    explicit TokenManager(const std::string& initialDate);

    // Token generation
    int generateToken();
    std::string generateFormattedToken();

    // Inspection & formatting
    int getNextToken() const;
    std::string getCurrentDate() const;
    static std::string formatToken(int token);
    bool isTokenIssued(int token) const;

    // Sequence manipulation & restart recovery
    void setNextToken(int val);
    void setCurrentDate(const std::string& date);
    void resetForNewDay(const std::string& newDate);
    void resetDailySequence();
    void recoverSequence(int highestExistingToken, const std::string& date);
};

#endif // TOKEN_MANAGER_H
