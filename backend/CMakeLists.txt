cmake_minimum_required(VERSION 3.15)
project(HospitalQueueBackend VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_definitions(-DNOMINMAX -D_CRT_SECURE_NO_WARNINGS -D_HAS_STD_BYTE=0)

find_package(Threads REQUIRED)

include_directories(
    dsa
    database
    api
    include
)

set(CORE_SOURCES
    "dsa/patient_queue.cpp"
    "dsa/hospital_dsa.cpp"
    "database/database_manager.cpp"
    "api/server.cpp"
)

add_executable(hospital_queue_backend ${CORE_SOURCES} "src/main.cpp")

if(WIN32)
    add_library(hospital_queue_core SHARED
        ${CORE_SOURCES}
        "src/main.cpp"
    )

    target_link_libraries(hospital_queue_backend PRIVATE ws2_32 crypt32 Threads::Threads)
    target_link_libraries(hospital_queue_core PRIVATE ws2_32 crypt32 Threads::Threads)
else()
    target_link_libraries(hospital_queue_backend PRIVATE Threads::Threads)
endif()
