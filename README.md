# Hospital Patient Queue Management System

A full-stack clinical queue management system engineered with a high-performance **C++ Academic DSA Queue Engine**, modern **React + Vite Frontend**, and persistent **MongoDB Atlas** document database.

---

## 1. Problem Statement
In busy outpatient clinics and hospitals, managing patient flow across multiple doctor consultation rooms poses critical operational challenges:
* **Queue Chaos & Manual Intervention**: Traditional manual token distribution is prone to favoritism, human error, and disordered physical lines.
* **Emergency Neglect**: When acute emergency patients arrive, manual queues struggle to dynamically preempt standard consultations without disrupting patient order.
* **Identity Duplication**: Multiple registrations lead to conflicting records, redundant consultations, and lack of longitudinal tracking for returning patients.
* **System Crash Vulnerability**: In-memory-only queues lose all patient queue states during server outages or reboots.

---

## 2. Objectives
1. **Algorithmic Priority**: Enforce strict priority for emergency patients while maintaining deterministic First-In-First-Out (FIFO) ordering for standard consultations using fundamental C++ Data Structures and Algorithms.
2. **Permanent Identity Lifecycle**: Automatically generate unique, immutable Patient IDs and centralized sequential daily consultation tokens.
3. **Multi-Doctor Isolation**: Maintain separate, independent queues for each consulting physician and consulting room.
4. **Crash Resilience & Persistence**: Guarantee zero patient queue loss through persistent MongoDB state recovery that accurately reconstructs active queues upon backend restart.
5. **Decoupled Architecture**: Provide a responsive React + Vite presentation layer that communicates exclusively via standard HTTP/REST JSON with the C++ backend.

---

## 3. System Architecture
```text
┌─────────────────────────────────────────────────────────────┐
│                 React + Vite Web Frontend                   │
│   (Presentation Layer: Forms, Telemetry Dashboard, Queues)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP / REST JSON
                               │ (src/services/api.js)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   C++ REST API Server                       │
│              (Thin HTTP JSON Layer / ApiServer)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ Academic DSA Layer           │ │ MongoDB Persistence Layer  │
│ (HospitalDSA & PatientQueue) │ │ (DatabaseManager)          │
│ - Fixed-array Circular Queue │ │ - Database:                │
│ - front, rear, itemCount     │ │   hospital_queue_db        │
│ - normalQueues[MAX_DOCTORS]  │ │ - Collections:             │
│ - emergencyQueues[MAX_DOCS]  │ │   * patients               │
│ - Linear Search (ID / Phone) │ │   * doctors                │
│ - Structures:                │ │   * consultations          │
│   Patient, Doctor,           │ └────────────────────────────┘
│   Registration               │
└──────────────────────────────┘
```
> **Core Architectural Rule**: React communicates **only** with the C++ REST API. React **never** accesses MongoDB directly. The C++ backend is the sole authority for token generation, queue operations, and validation rules.

---

## 4. Key Features
* **Patient Registration**: Minimal user entry (Name, Age, Gender, Phone); C++ auto-generates permanent Patient ID (`#101`, `#102`...).
* **Patient Lookup**: Dual search by permanent Patient ID or 10-digit mobile number using linear search.
* **Patient Update**: Edit patient demographics while strictly preserving Patient ID immutability.
* **Consultation Booking**: Read-only demographic context, manual doctor selection, emergency priority flag, and chief symptom description.
* **Duplicate Consultation Prevention**: Guard against registering a second active waiting consultation for a patient (`HTTP 409 Conflict`).
* **Emergency Preemption**: Emergency patients bypass standard FIFO queues and are dispatched next in turn.
* **Physician Isolation**: Doctor A's queue operations have zero cross-talk with Doctor B's queue.
* **Processing Workstation**: Doctor calls and completes patients with automatic status updates (`Waiting` $\to$ `Completed`).
* **Permanent Token Retirement**: Cancelled consultations are retired permanently from active queues; cancelled tokens are **never** reused.
* **Returning Patient Workflow**: Returning patients retain their original Patient ID and receive brand-new sequential consultation tokens.
* **Live Dashboard Telemetry**: Real-time waiting counts, priority breakdowns, physician roster, and database health metrics.

---

## 5. Technologies Used
* **Backend**: C++ (ISO C++17), MSVC v143, CMake 3.20+, cpp-httplib, nlohmann-json.
* **Frontend**: React 18, Vite 5, React Router v7, Modern CSS.
* **Database**: MongoDB Atlas (Cloud Cluster `hospital-queue.4i1oscg.mongodb.net`, database `hospital_queue_db`) via `mongosh` CLI integration.
* **Testing & Automation**: Python 3.10+, Windows Command Shell batch scripts, `mongosh`.

---

## 6. DSA Concepts & Implementations
| DSA Concept | C++ Implementation | Purpose / Responsibility |
|---|---|---|
| **Circular Queue ADT** | `PatientQueue` (`data[MAX_QUEUE_SIZE]`, `front`, `rear`, `itemCount`) | Strict First-In-First-Out ordering with circular indexing modulo `MAX_QUEUE_SIZE`. |
| **Multi-Queue Array** | `normalQueues[MAX_DOCTORS]`, `emergencyQueues[MAX_DOCTORS]` | Fixed-size array of queue ADTs guaranteeing doctor-specific queue isolation. |
| **Triage Priority Logic** | Composite check: `!emergencyQueues[dIdx].isEmpty()` | Prioritizes emergency queue over normal queue before dispatching. |
| **Linear Search** | `findPatientById`, `findPatientByPhone` ($O(n)$) | Predictable, syllabus-aligned linear scanning over structures. |
| **Structures** | `struct Patient`, `struct Doctor`, `struct Registration` | Plain Data Structures grouping domain attributes. |
| **Dynamic Arrays / Vectors** | `vector<Patient>`, `vector<Doctor>`, `vector<Registration>` | Storage for directory listings and complete consultation history. |
| **Strings & Formatting** | `string`, `ostringstream` | Input validation, token formatting (`001`, `002`), and timestamp generation. |

---

## 7. Core Data Structures
```cpp
struct Patient {
    int patientId;
    string name;
    int age;
    string gender;
    string phone;
};

struct Doctor {
    int doctorId;
    string name;
    string specialization;
    int roomNo;
};

struct Registration {
    int tokenNo;
    int patientId;
    string patientName;
    int doctorId;
    string doctorName;
    int roomNo;
    string healthIssue;
    bool emergency;
    string status;
    string createdAt;
    string updatedAt;
};
```

---

## 8. Clinical Workflows

### 8.1 Patient Registration Workflow
1. Receptionist inputs Patient Name, Age, Gender, and 10-digit Phone into React form.
2. Form submits `POST /api/patients`.
3. C++ validates input and generates the next permanent `patientId` (e.g. `101`).
4. Patient is saved in MongoDB `patients` collection.
5. React displays success banner with prominent permanent Patient ID (`#101`).

### 8.2 Consultation Registration & Priority Workflow
1. Receptionist enters Patient ID; frontend fetches verified demographics as read-only.
2. Receptionist selects attending physician from directory, inputs chief symptoms, and sets priority toggle (Normal vs. Emergency).
3. Form submits `POST /api/consultations`.
4. C++ verifies patient has no existing `Waiting` consultation.
5. C++ issues common sequential token (`001`, `002`, etc.).
6. Consultation is stored in MongoDB `consultations` collection with status `"Waiting"`.
7. Enqueued into `emergencyQueues[dIdx]` or `normalQueues[dIdx]`.
8. React displays printable token receipt.

### 8.3 Doctor Queue Processing Workflow
1. Doctor opens workstation at `/process-patient` and selects their room.
2. Frontend queries `GET /api/queues/:doctorId`.
3. C++ returns `nextPatient` and `effectiveProcessingOrder`:
   - If emergency queue is non-empty $\to$ front of emergency queue.
   - Else if normal queue is non-empty $\to$ front of normal queue.
4. Doctor clicks *"Call & Complete Consultation"*.
5. Frontend calls `POST /api/queues/:doctorId/process`.
6. C++ dequeues the patient from the queue, marks the record as `"Completed"` in MongoDB, and returns the completed summary.

### 8.4 Cancellation & Non-Reuse Workflow
1. Staff searches consultation by token number at `/cancel-consultation`.
2. Frontend displays consultation details and asks for confirmation with a non-reuse warning.
3. Staff confirms $\to$ `POST /api/consultations/:token/cancel`.
4. C++ removes registration from active queue and updates status to `"Cancelled"` in MongoDB.
5. The token is permanently retired; subsequent patients receive strictly subsequent tokens.

### 8.5 Returning Patient Workflow
1. An existing patient whose previous consultation is `"Completed"` or `"Cancelled"` visits the hospital again.
2. Staff looks up patient by Phone or ID.
3. Patient retains original permanent Patient ID (`#101`).
4. Staff books a new consultation.
5. C++ accepts registration and issues a brand-new sequential token.
6. MongoDB stores both consultations in the patient's complete longitudinal audit history.

---

## 9. MongoDB Database & Collections
* **Database**: `hospital_queue_db`
* **Collections**:
  * `patients`: `{ patientId, patientName, age, gender, phone }`
  * `doctors`: `{ doctorId, doctorName, specialization, roomNo }`
  * `consultations`: `{ tokenNo, patientId, patientName, doctorId, doctorName, roomNo, healthIssue, emergency, status, createdAt, updatedAt }`

### System Recovery Mechanism
Upon backend startup:
1. Re-indexes existing patients and sets `nextPatientId = max(patientId) + 1`.
2. Loads all doctor directory entries.
3. Loads all historical consultations.
4. Rebuilds active in-memory `emergencyQueues` and `normalQueues` from all consultations with status `"Waiting"`, strictly preserving priority and FIFO order.
5. Sets `nextTokenNumber = max(tokenNo) + 1` so token generation resumes monotonically without collision.

---

## 10. REST API Specification
| Endpoint | Method | Description | Error Codes |
|---|---|---|---|
| `/api/health` | GET | Liveness probe returning `{ status: "UP" }` | 503 |
| `/api/status` | GET | System telemetry: doctor counts, active waiting, MongoDB status | — |
| `/api/dashboard/stats` | GET | Live dashboard metrics (total, emergency, normal, per-doctor) | — |
| `/api/patients` | POST | Register new patient (No Patient ID in payload) | 400, 409, 500 |
| `/api/patients/:id` | GET | Retrieve patient profile by ID | 404 |
| `/api/patients/search?phone=` | GET | Retrieve patient profile by 10-digit phone | 400, 404 |
| `/api/patients/:id` | PUT | Update demographics (Patient ID immutable) | 400, 404, 409, 500 |
| `/api/doctors` | GET | List all active consulting physicians | — |
| `/api/doctors` | POST | Register new physician | 400, 409, 500 |
| `/api/doctors/:id` | GET | Retrieve physician details by ID | 404 |
| `/api/consultations` | POST | Book consultation (Auto sequential token) | 400, 404, 409, 500 |
| `/api/consultations` | GET | Search/filter consultations by status & doctor | — |
| `/api/consultations/:token` | GET | Retrieve consultation record by token | 404 |
| `/api/consultations/:token` | PUT | Update waiting consultation (Doctor, emergency, symptom) | 400, 404, 500 |
| `/api/consultations/:token/cancel` | POST | Cancel waiting consultation (Token retired) | 400, 404, 500 |
| `/api/queues/:doctorId` | GET | Inspect doctor's live emergency and normal queues | 404 |
| `/api/queues/:doctorId/process` | POST | Dequeue and complete next patient by C++ priority | 400, 404, 500 |

---

## 11. Verification & Test Suite Summary
The system has been verified through a multi-tier automated test suite:

| Phase / Suite | Scope & Description | Test Count | Status |
|---|---|---|---|
| **DSA Queue Engine** | Circular Queue, FIFO, Priority, Edge Cases | 10 / 10 | **PASSED** |
| **Patient Management** | Unique Phone, Linear Search, Age/Gender Bounds | 18 / 18 | **PASSED** |
| **Doctor Management** | Multi-Doctor Isolation, Capacity Bounds | 17 / 17 | **PASSED** |
| **MongoDB Persistence** | mongosh Operations, Crash Recovery | 35 / 35 | **PASSED** |
| **C++ REST API** | Complete Route & Error Code Compliance | 36 / 36 | **PASSED** |
| **Frontend Workflows** | Telemetry, Forms, Live Queues | 32 / 32 | **PASSED** |
| **Full E2E Suite** | React $\leftrightarrow$ C++ $\leftrightarrow$ DSA $\leftrightarrow$ MongoDB | 74 / 74 | **PASSED** |
| **Recovery & Consistency** | Rollbacks, Persistence Failures, Restart | 33 / 33 | **PASSED** |
| **Frontend Build** | Vite Production Bundle & Lint Check | 74 modules | **PASSED** |
| **TOTAL** | **Exhaustive Automated Verifications** | **255 / 255** | **100% PASSED** |

---

## 12. How to Run the Project

### Prerequisites
* Windows 10/11 with MSVC v143 (Visual Studio 2022 Build Tools)
* MongoDB Atlas cluster or local MongoDB Community Server running on port `27017`
* `mongosh` (MongoDB Shell) installed and on system PATH
* Node.js v18+ and npm
* Python 3.10+ (for test runners and launcher)

### Database Configuration (.env)
The C++ backend automatically reads database credentials from `.env` in the project root:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@hospital-queue.4i1oscg.mongodb.net/?appName=hospital-queue
MONGODB_DB_NAME=hospital_queue_db
```
* If `.env` (or environment variables) are present, the backend connects directly to MongoDB Atlas.
* If `.env` is absent, the backend gracefully falls back to local `mongodb://localhost:27017`.
* Password credentials are automatically sanitized (`***`) in all system logs and console output.

### 1. Build C++ Backend
```cmd
scripts\build_backend.bat
```

### 2. Build Production Frontend (Optional)
```cmd
cd frontend
npm run build
```

### 3. Start the Application
```cmd
:: Terminal 1: Start C++ Backend Server (Port 8080)
scripts\run_backend.bat

:: Terminal 2: Start Frontend Development Server (Port 5173)
scripts\run_frontend.bat
```
Navigate to `http://localhost:5173` in your browser.

---

## 13. Limitations & Future Scope
### Current Scope Boundaries
* Designed specifically as a **Hospital Patient Queue Management System**.
* Explicitly does **not** include hospital ERP modules (billing, pharmacy, laboratories, inpatient ward management, inventory).

### Future Potential Enhancements
* Multi-counter public LED queue display board with audio announcements.
* SMS / WhatsApp notification integration when patient's turn is approaching.
* Multi-lingual localization for diverse hospital regional environments.
