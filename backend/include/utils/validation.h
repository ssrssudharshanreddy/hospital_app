#ifndef VALIDATION_H
#define VALIDATION_H

#include <string>
#include <cctype>
#include <algorithm>
using namespace std;

class Validation {
public:
    static bool isNonEmpty(const string& str) {
        for (char c : str) {
            if (!isspace(static_cast<unsigned char>(c))) return true;
        }
        return false;
    }

    static bool isValidAge(int age) {
        return age >= 1 && age <= 120;
    }

    static bool isValidPhone(const string& phone) {
        if (phone.length() != 10) return false;
        for (char c : phone) {
            if (!isdigit(static_cast<unsigned char>(c))) return false;
        }
        return true;
    }

    static bool isValidGender(const string& gender) {
        if (!isNonEmpty(gender)) return false;
        string g = gender;
        transform(g.begin(), g.end(), g.begin(), [](unsigned char c) {
            return static_cast<char>(tolower(c));
        });
        return (g == "male" || g == "female" || g == "other" ||
                g == "m" || g == "f" || g == "o");
    }
};

#endif