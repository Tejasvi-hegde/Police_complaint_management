# System Design Documents

## 1. SQL Schema (3NF - Final)

```sql
-- Table: PoliceStation
CREATE TABLE PoliceStation (
    station_id SERIAL PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_number VARCHAR(15),
    in_charge_officer_id INT
);

-- Table: Victim (Citizen)
CREATE TABLE Victim (
    victim_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: PoliceOfficer
CREATE TABLE PoliceOfficer (
    officer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rank VARCHAR(50),
    station_id INT NOT NULL,
    FOREIGN KEY (station_id) REFERENCES PoliceStation(station_id)
);

-- Table: Complaint
CREATE TABLE Complaint (
    complaint_id SERIAL PRIMARY KEY,
    victim_id INT NOT NULL,
    station_id INT, -- Assigned Station
    assigned_officer_id INT, -- Assigned Officer
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    incident_location VARCHAR(255),
    incident_date TIMESTAMP,
    category VARCHAR(50),
    severity_level VARCHAR(20) CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    current_status VARCHAR(50) DEFAULT 'PENDING',
    visibility VARCHAR(20) DEFAULT 'PRIVATE', -- PRIVATE, VICTIM, PUBLIC
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (victim_id) REFERENCES Victim(victim_id),
    FOREIGN KEY (station_id) REFERENCES PoliceStation(station_id),
    FOREIGN KEY (assigned_officer_id) REFERENCES PoliceOfficer(officer_id)
);

-- Table: ComplaintStatus (History of status changes)
CREATE TABLE ComplaintStatus (
    status_id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    updated_by_officer_id INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (complaint_id) REFERENCES Complaint(complaint_id),
    FOREIGN KEY (updated_by_officer_id) REFERENCES PoliceOfficer(officer_id)
);

-- Table: Summon
CREATE TABLE Summon (
    summon_id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL,
    issued_by_officer_id INT NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_address TEXT,
    appearance_date TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaint(complaint_id),
    FOREIGN KEY (issued_by_officer_id) REFERENCES PoliceOfficer(officer_id)
);

-- Indexes
CREATE INDEX idx_complaint_victim ON Complaint(victim_id);
CREATE INDEX idx_complaint_station ON Complaint(station_id);
CREATE INDEX idx_officer_station ON PoliceOfficer(station_id);
```

## 2. NoSQL Schemas (MongoDB)

### Collection: CaseUpdates
**Purpose:** Stores dynamic timeline/chat-like updates for a complaint.
```json
{
  "_id": "ObjectId",
  "complaint_id": "Integer (Reference to SQL Complaint.complaint_id)",
  "updates": [
    {
      "update_id": "ObjectId",
      "text": "String",
      "author_role": "String (POLICE/VICTIM)",
      "author_id": "Integer",
      "timestamp": "ISODate",
      "visibility": "String (PRIVATE/VICTIM/PUBLIC)"
    }
  ]
}
```

### Collection: EvidenceRecords
**Purpose:** Stores unstructured evidence metadata and file links.
```json
{
  "_id": "ObjectId",
  "complaint_id": "Integer",
  "evidence_type": "String (IMAGE/VIDEO/DOCUMENT)",
  "file_url": "String",
  "description": "String",
  "uploaded_by_officer_id": "Integer",
  "uploaded_at": "ISODate",
  "tags": ["String"],
  "visibility": "String"
}
```

## 3. ER Diagram Data

**Entities & Attributes:**
1.  **Victim**: victim_id (PK), name, email, phone, address.
2.  **PoliceStation**: station_id (PK), name, location.
3.  **PoliceOfficer**: officer_id (PK), name, badge, rank, *station_id* (FK).
4.  **Complaint**: complaint_id (PK), title, description, *victim_id* (FK), *station_id* (FK), *officer_id* (FK).
5.  **Summon**: summon_id (PK), *complaint_id* (FK), recipient, date.

**Relationships:**
*   Victim **1 : N** Complaint (A victim lodges multiple complaints)
*   PoliceStation **1 : N** PoliceOfficer (Station employs officers)
*   PoliceStation **1 : N** Complaint (Station handles complaints)
*   PoliceOfficer **1 : N** Complaint (Officer investigates complaints)
*   Complaint **1 : N** Summon (Complaint generates summons)
*   Complaint **1 : 1** (Virtual) CaseUpdates (MongoDB)

**Cardinality:**
*   Victim (1) --- (0..N) Complaint
*   Station (1) --- (1..N) Officer
*   Officer (1) --- (0..N) Complaint
*   Complaint (1) --- (0..N) Summon

## 4. Normalization Output

**UNF (Unnormalized Form - Example Report):**
`ComplaintReport(ComplaintID, VictimName, VictimAddress, StationName, OfficerName, IncidentDesc, StatusHistory...)`
*   Contains repeating groups (StatusHistory) and derived data.

**1NF (First Normal Form):**
*   Remove repeating groups.
*   `Complaint(ComplaintID, VictimName, StationName...)`
*   `Status(ComplaintID, Status, Date)`
*   *Issue:* VictimName depends on Victim, not just Complaint. StationName depends on StationID.

**2NF (Second Normal Form):**
*   Remove partial dependencies.
*   `Victim(VictimID, Name, Address)`
*   `Station(StationID, Name, Location)`
*   `Complaint(ComplaintID, VictimID, StationID, Description)`
*   `ComplaintStatus(StatusID, ComplaintID, Status)`

**3NF (Third Normal Form):**
*   Remove transitive dependencies.
*   Ensure all non-key attributes are fully dependent only on the Primary Key.
*   **Result**: The SQL Schema provided in Section 1 is in 3NF. (e.g., `Officer` depends on `Station`, but `Officer` attributes are in `PoliceOfficer` table, linked by `station_id`. No transitive dependency like `Complaint -> Officer -> OfficerRank` stored in Complaint).

## 5. DFD Output

### Level 0 DFD (Context Diagram)
**Entities:** Victim, Police Officer, Admin.
**Process:** Complaint Management System (CMS).

*   **Victim** --(Lodge Complaint)--> **CMS**
*   **CMS** --(Complaint Status)--> **Victim**
*   **CMS** --(Assign Case)--> **Police Officer**
*   **Police Officer** --(Update Status/Evidence)--> **CMS**

### Level 1 DFD (Breakdown)
1.  **Process 1.0: Reg/Login**
    *   Victim -> 1.0 -> User DB
2.  **Process 2.0: Lodge Complaint**
    *   Victim -> 2.0 -> Complaint DB
    *   2.0 -> (Geo-Assignment) -> 3.0
3.  **Process 3.0: Assign Officer**
    *   Admin/System -> 3.0 -> Complaint DB (Update OfficerID)
4.  **Process 4.0: Investigation**
    *   Officer -> 4.0 -> Evidence DB (Mongo) / Updates DB (Mongo)
5.  **Process 5.0: Public Search**
    *   Public User -> 5.0 -> Complaint DB (Read Only)
