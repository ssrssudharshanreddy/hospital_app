#ifndef LOGGER_H
#define LOGGER_H

#include <iostream>
#include <string>
#include <sstream>
#include <chrono>
#include <iomanip>

enum class LogLevel {
    Info,
    Warn,
    Error,
    Debug
};

class Logger {
public:
    static void log(LogLevel level, const std::string& message) {
        auto now = std::chrono::system_clock::now();
        auto in_time_t = std::chrono::system_clock::to_time_t(now);
        std::tm timeInfo;
        localtime_s(&timeInfo, &in_time_t);

        std::string levelStr;
        switch (level) {
            case LogLevel::Info:  levelStr = "[INFO]"; break;
            case LogLevel::Warn:  levelStr = "[WARN]"; break;
            case LogLevel::Error: levelStr = "[ERROR]"; break;
            case LogLevel::Debug: levelStr = "[DEBUG]"; break;
        }

        std::cout << std::put_time(&timeInfo, "%Y-%m-%d %H:%M:%S")
                  << " " << levelStr << " " << message << std::endl;
    }

    static void info(const std::string& message) { log(LogLevel::Info, message); }
    static void warn(const std::string& message) { log(LogLevel::Warn, message); }
    static void error(const std::string& message) { log(LogLevel::Error, message); }
    static void debug(const std::string& message) { log(LogLevel::Debug, message); }
};

#endif // LOGGER_H
