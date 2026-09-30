#ifndef VALIDATION_H
#define VALIDATION_H

#include <string>
#include <cctype>
#include <algorithm>

class Validation {
public:
    static bool isNonEmpty(const std::string& str) {
        for (char c : str) {
            if (!std::isspace(static_cast<unsigned char>(c))) return true;
        }
        return false;
    }

    static bool isValidAge(int age) {
        return age >= 1 && age <= 120;
    }

    static bool isValidPhone(const std::string& phone) {
        if (phone.length() != 10) return false;
        for (char c : phone) {
            if (!std::isdigit(static_cast<unsigned char>(c))) return false;
        }
        return true;
    }

    static bool isValidGender(const std::string& gender) {
        if (!isNonEmpty(gender)) return false;
        std::string g = gender;
        std::transform(g.begin(), g.end(), g.begin(), [](unsigned char c) {
            return static_cast<char>(std::tolower(c));
        });
        return (g == "male" || g == "female" || g == "other" ||
                g == "m" || g == "f" || g == "o");
    }
};

#endif // VALIDATION_H
