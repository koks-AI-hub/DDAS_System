# Functional Requirements Document (FRD)

## Project Title
Data Download Duplication Alert System (DDAS) for Institutional Network Optimization

---

# 1. Project Overview

The Data Download Duplication Alert System (DDAS) is a web-based application designed to prevent redundant dataset downloads within institutional environments.

In universities and research institutions, multiple users often download identical datasets from external sources, which results in:

- Excessive bandwidth usage
- Increased server CPU load
- Higher storage consumption
- Unnecessary electrical energy usage
- Increased carbon emissions from data centers

DDAS addresses this issue by detecting duplicate datasets using cryptographic hashing and redirecting users to an existing local copy instead of downloading the same dataset again.

The system also calculates the estimated energy savings and CO₂ reduction achieved by preventing duplicate downloads.

---

# 2. Technology Stack

Frontend:
- React.js
- Bootstrap UI
- Chart.js for analytics visualization

Backend / Data Layer:
- Supabase PostgreSQL Database
- Supabase Authentication
- Supabase Storage

Libraries:
- @supabase/supabase-js
- crypto-js (SHA256 hashing)
- react-dropzone (file uploads)

---

# 3. System Actors

### Admin
Institution administrator responsible for monitoring system performance.

Permissions:
- View dashboard analytics
- Manage datasets
- View download logs
- View energy reports
- Manage users

### User
Institution member (student/researcher/staff).

Permissions:
- Login to system
- Upload datasets
- Download datasets
- Access repository
- View download history

---

# 4. Core Modules

The system consists of the following modules:

1. Authentication Module
2. Dashboard Analytics Module
3. Dataset Upload Module
4. Dataset Repository Module
5. Duplicate Detection Engine
6. Download Logging Module
7. Energy Impact Calculation Module
8. Reporting Module

---

# 5. Authentication Module

Users authenticate using Supabase Authentication.

### Functional Requirements

FR-AUTH-1  
Users must login using email and password.

FR-AUTH-2  
After successful login, users are redirected to the dashboard.

FR-AUTH-3  
User roles determine access permissions.

Admin → Full access  
User → Limited access

---

# 6. Dashboard Analytics Module

The dashboard provides real-time system statistics.

### Metrics Displayed

- Total datasets stored
- Total download requests
- Duplicate downloads prevented
- Bandwidth saved
- Energy saved
- CO₂ emission reduction

### Visualizations

Charts should display:

- Downloads over time
- Duplicate downloads prevented
- Energy savings trend

---

# 7. Dataset Upload Module

Users can upload datasets into the institutional repository.

### Upload Flow

User uploads dataset file.

System performs the following actions:

1. File stored in Supabase Storage bucket "datasets"
2. File metadata extracted
3. SHA256 hash generated
4. Database checked for duplicates
5. If duplicate exists → upload prevented
6. If new dataset → metadata stored

### Metadata Stored

- file_name
- file_size
- hash_value
- storage_path
- uploaded_by
- created_at

---

# 8. Dataset Repository Module

The repository displays all datasets stored in the system.

### Repository Table Fields

- Dataset name
- File size
- Upload date
- Uploaded by
- Download button

Users can download datasets directly from the repository.

---

# 9. Duplicate Detection Engine

The duplicate detection engine prevents redundant dataset downloads.

### Algorithm

1. Generate SHA256 hash of uploaded file
2. Query database for existing hash

Query Example:

SELECT * FROM datasets WHERE hash_value = generated_hash

### Outcomes

If hash exists:

- System displays duplicate alert
- Upload prevented
- User redirected to existing dataset

If hash does not exist:

- Dataset uploaded
- Metadata stored in database

---

# 10. Download Logging Module

Every dataset download request must be recorded.

### Download Log Fields

- dataset_id
- user_id
- duplicate_detected
- download_source
- requested_at

download_source values:

- local
- external

---

# 11. Energy Impact Calculation Module

When duplicate downloads are prevented, the system calculates estimated energy savings.

### Energy Calculation Formula

Energy = Power × Time

Where:

Power = server power consumption (watts)  
Time = processing duration (hours)

Example:

Server power = 400W  
Download time = 10 minutes

Time = 10/60 = 0.166 hours

Energy saved:

400 × 0.166 = 66.4 Wh  
= 0.0664 kWh

### CO₂ Reduction

CO₂ reduction is calculated using:

CO₂ = energy_saved_kwh × 0.82

Example:

0.0664 × 0.82 = 0.054 kg CO₂

---

# 12. Reporting Module

Admin can view analytical reports summarizing system performance.

### Reports Include

- Monthly downloads
- Duplicate downloads prevented
- Bandwidth saved
- Energy saved
- CO₂ emission reduction

Reports should support export in:

- CSV
- PDF

---

# 13. Database Schema

### users

id (uuid)  
name  
email  
role  
institution  
created_at

---

### datasets

id (uuid)  
file_name  
file_size  
hash_value  
storage_path  
uploaded_by  
created_at

---

### downloads

id (uuid)  
dataset_id  
user_id  
duplicate_detected  
download_source  
requested_at

---

### energy_logs

id (uuid)  
dataset_id  
energy_saved_kwh  
bandwidth_saved_mb  
co2_reduction  
created_at

---

# 14. Storage Configuration

Supabase Storage bucket:

datasets

Purpose:

Store uploaded dataset files.

Example structure:

datasets/
climate_data.csv
research_data.xlsx

---

# 15. Complete System Flow

User Login  
→ Dashboard loads analytics  
→ User uploads dataset  
→ System generates SHA256 hash  
→ System checks database for duplicates

If duplicate exists:

→ Alert user  
→ Redirect to existing dataset  
→ Log duplicate event  
→ Calculate energy savings

If dataset is new:

→ Upload file to storage  
→ Store metadata in database

User downloads dataset

→ Log download event  
→ Update analytics dashboard

---

# 16. Pages Required

The application must include the following pages:

1. Login Page
2. Dashboard
3. Dataset Upload Page
4. Dataset Repository Page
5. Download Logs Page
6. Energy Analytics Page

---

# 17. Security Requirements

- Authentication required for all users
- Role-based access control
- Secure database access via Supabase
- File uploads validated before storage

---

# 18. Non-Functional Requirements

Performance:
System should handle concurrent dataset uploads and downloads.

Scalability:
System must support multiple institutional users.

Usability:
Interface must be simple and intuitive.

Security:
Authentication and database access must be secured.

---

# 19. Expected System Output

Examples of system responses:

Duplicate detected  
"Dataset already exists in the repository."

Upload success  
"Dataset uploaded successfully."

Download redirect  
"Redirecting to local dataset copy."

Energy savings notification  
"Duplicate prevented. Estimated energy saved: 0.066 kWh."

---

# 20. Project Deliverables

The final system must include:

- Web application
- Duplicate detection engine
- Dataset metadata repository
- Energy impact calculation module
- Analytics dashboard
- Documentation report
- Architecture diagram
- Flowchart
- Presentation slides





