cmake_minimum_required(VERSION 3.15)
project(HospitalQueueBackend VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_definitions(-DNOMINMAX -D_CRT_SECURE_NO_WARNINGS)

include_directories(include)

# Core DSA & Service Sources
set(CORE_SOURCES
    "src/core/queue_manager.cpp"
    "src/core/patient_manager.cpp"
    "src/core/doctor_manager.cpp"
    "src/core/token_manager.cpp"
    "src/core/consultation_manager.cpp"
    "src/core/system_recovery.cpp"
    "src/db/database_manager.cpp"
    "src/api/server.cpp"
)

# 1. Main Standalone Server Executable
add_executable(hospital_queue_backend ${CORE_SOURCES} "src/main.cpp")

# 2. Shared Library (DLL) for Windows Native Execution / Launcher
add_library(hospital_queue_core SHARED
    ${CORE_SOURCES}
    "src/main.cpp"
)

if(WIN32)
    target_link_libraries(hospital_queue_backend PRIVATE ws2_32 crypt32)
    target_link_libraries(hospital_queue_core PRIVATE ws2_32 crypt32)
endif()
