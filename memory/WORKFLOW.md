# EduUplift - CSR Education Platform Workflow Documentation

## Platform Overview

**EduUplift** is a Corporate Social Responsibility (CSR) education funding platform connecting Indian corporations with underprivileged students preparing for IIT-JEE and NEET competitive exams. The platform facilitates transparent sponsorship, verification, and progress tracking.

---

## User Roles

| Role | Purpose |
|------|---------|
| **Student** | Apply for sponsorship, upload documents, track academic progress |
| **Company** | Browse students, sponsor, track ROI, manage tax compliance |
| **Admin** | Verify students, manage data, add progress reports, oversee platform |

---

## 1. Student Workflow

### 1.1 Registration & Profile Creation
```
Landing Page → "Get Started" → Register as Student
```

**Required Information:**
- Full Name, Email, Password
- Phone Number, Date of Birth
- School Name, Class 10th Percentage
- Address Details

### 1.2 Document Upload (Verification)
After registration, students must upload three verification documents:

| Document | Purpose |
|----------|---------|
| **Income Certificate** | Proves financial need (underprivileged status) |
| **Class 10th Marksheet** | Academic performance verification |
| **Aadhar Card** | Identity verification |

**Document States:**
- ⏳ `not_uploaded` - Document pending
- 📄 `uploaded` - Awaiting admin review
- ✅ `verified` - Admin approved
- ❌ `rejected` - Admin rejected (must re-upload)

### 1.3 Student Dashboard States

The student dashboard dynamically changes based on sponsorship lifecycle:

```
┌─────────────────────────────────────────────────────────────────┐
│  State 1: PENDING VERIFICATION                                   │
│  ───────────────────────────────────────────────────────────────│
│  • Shows document upload interface                               │
│  • Application status timeline visible                           │
│  • Cannot be seen by companies yet                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  State 2: AWAITING SPONSORSHIP                                   │
│  ───────────────────────────────────────────────────────────────│
│  • Profile is verified and visible to companies                  │
│  • Shows "Profile Views" count                                   │
│  • Waiting for a company to sponsor                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  State 3: PENDING INSTITUTE SELECTION                            │
│  ───────────────────────────────────────────────────────────────│
│  • Just got sponsored!                                           │
│  • Must select coaching institute from available options         │
│  • Shows budget allocation                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  State 4: ENROLLED                                               │
│  ───────────────────────────────────────────────────────────────│
│  • Full dashboard with all features                              │
│  • Coaching details, funding breakdown, exam performance         │
│  • Progress timeline with admin-added reports                    │
│  • Sponsorship details and sponsor information                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Institute Selection Flow
```
Student Sponsored → Receives notification → 
Opens Dashboard → Sees Institute Selection prompt →
Browses available institutes (with rating, fee, success rate) →
Selects institute → Confirms selection →
Admin gets notified → Student moves to "Enrolled" state
```

---

## 2. Company Workflow

### 2.1 Registration
```
Landing Page → "Get Started" → Register as Company
```

**Required Information:**
- Company Name
- Company Email, Password
- Contact Person Details

### 2.2 Company Dashboard Features

| Tab | Functionality |
|-----|---------------|
| **Browse Students** | View verified students with filters (coaching type, percentage, location) |
| **Advanced Search** | Detailed filters: score range, exam type, gender, age, availability |
| **Sponsored Students** | Track progress of students you're sponsoring |
| **Sponsorship Packages** | Create structured sponsorship packages with eligibility criteria |
| **Tax & Compliance** | View 80G certificates, CSR commitment tracking |
| **Analytics** | Impact metrics, ROI, performance trends |
| **Messages** | Communicate with students and admin |

### 2.3 Sponsorship Flow
```
Company browses verified students →
Clicks "Sponsor Student" →
Sets sponsorship amount and duration →
Student receives notification →
Student selects institute →
Sponsorship becomes active →
Company can track progress
```

### 2.4 Sponsorship Packages (Optional)
Companies can create structured packages:
```
Package Creation:
├── Package Name (e.g., "IIT Dream Package")
├── Total Amount (e.g., ₹5,00,000)
├── Duration (e.g., 2 years)
├── Benefits Breakdown
│   ├── Tuition Fees
│   ├── Coaching
│   ├── Books & Materials
│   ├── Monthly Stipend
│   └── Hostel (if applicable)
├── Eligibility Criteria
│   ├── Minimum Academic Score
│   ├── Target Exam (JEE/NEET)
│   └── Maximum Family Income
└── Available Slots
```

### 2.5 Tax Compliance & 80G Certificates
```
Company Dashboard → Tax & Compliance Tab →
View Financial Summary (FY-wise) →
See CSR Commitment vs Disbursed amounts →
Tax Benefit calculation (80G = 50% of donation) →
Download issued 80G certificates
```

---

## 3. Admin Workflow

### 3.1 Admin Dashboard Tabs

| Tab | Purpose |
|-----|---------|
| **Overview** | Platform statistics (students, companies, funds) |
| **Verify Students** | Review pending verifications, approve/reject |
| **Manage Students** | Update coaching, funding, exam details for sponsored students |
| **CSR Partners** | Manage company partnerships, tiers, impact scores |
| **Success Stories** | Add student success stories for landing page |
| **User Credentials** | View/reset user passwords (admin-only security feature) |
| **Analytics** | Platform-wide analytics and trends |

### 3.2 Student Verification Flow
```
Student uploads documents →
Admin receives notification →
Admin Dashboard → Verify Students tab →
Reviews documents (Income, Marksheet, Aadhar) →
Clicks "Verify" or "Reject" →
Student receives notification →
If verified: Student profile visible to companies
```

### 3.3 Managing Sponsored Students

Once a student is sponsored, admin can manage:

**Coaching Details:**
- Institute name & location
- Coaching type (IIT-JEE/NEET)
- Batch year, enrollment date, expected exam date

**Funding Details:**
- Total allocated amount
- Utilized amount
- Payment schedule (Monthly/Quarterly/Annual)
- Funding breakdown (tuition, materials, hostel, transport)

**Exam Performance:**
- Add mock tests with subject breakdown
- Record actual exam results
- Update final results with AIR rank and college allotment

### 3.4 Progress Report Flow
```
Admin Dashboard → Manage Students tab →
Select a sponsored student →
Fill Progress Report Form:
├── Attendance Percentage
├── Class Rank
├── Subject Scores
├── Monthly Funding Utilized
└── Optional: Mock Test Details
→ Submit Report →
Company (sponsor) receives notification →
Report visible in Company Dashboard
```

### 3.5 CSR Partners Management
```
Admin Dashboard → CSR Partners tab →
View all partner companies with metrics:
├── Impact Score
├── Students Sponsored
├── Total Funds
└── Tier (Diamond/Platinum/Gold/Silver/Bronze)
→ Update partnership details
→ Issue 80G certificates
```

---

## 4. Notification System

### Notification Types
| Type | Trigger | Recipient |
|------|---------|-----------|
| `verification` | Document verified/rejected | Student |
| `sponsorship` | New sponsorship created | Student, Admin |
| `document` | Document uploaded | Admin |
| `progress` | Progress report added | Company |
| `message` | New message received | All roles |
| `system` | Platform announcements | All users |
| `payment` | Fund disbursement | Student, Company |

### Notification Flow
```
Event occurs (e.g., student verified) →
Backend creates notification record →
User sees bell icon with unread count →
Clicks to view notifications →
Can mark as read or delete
```

---

## 5. Messaging System

### Features
- Internal messaging between users
- Folders: Inbox, Sent, Starred, Archived
- Thread-based conversations
- Search and pagination

### Communication Matrix
| From | To | Use Case |
|------|-----|----------|
| Student | Admin | Document clarification, support |
| Student | Company | Thank you notes, queries |
| Company | Student | Encouragement, guidance |
| Company | Admin | Compliance queries, reports |
| Admin | Student | Document requests, updates |
| Admin | Company | Partnership updates, certificates |

---

## 6. Public Features (No Login Required)

### Landing Page Sections
1. **Hero Section** - Platform introduction with stats
2. **How It Works** - 3-step process explanation
3. **Impact Stats** - Live counters (students helped, funds raised)
4. **Company Leaderboard** - Top sponsors with tier badges
5. **Success Stories** - Student achievements (AIR ranks, colleges)
6. **CTA Section** - Registration prompt

### Company Leaderboard Tiers
```
Diamond    🏆 Impact Score ≥ 5000
Platinum   🥈 Impact Score ≥ 2000
Gold       🥉 Impact Score ≥ 1000
Silver     ⚪ Impact Score ≥ 500
Bronze     🟤 Impact Score < 500

Impact Score = (Students × 100) + (Funds ÷ 1000) + (Success × 500)
```

---

## 7. Data Flow Diagrams

### Complete Sponsorship Lifecycle
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE SPONSORSHIP LIFECYCLE                        │
└──────────────────────────────────────────────────────────────────────────────┘

Student                    Admin                      Company
────────                   ─────                      ───────
   │                         │                           │
   │ 1. Register             │                           │
   ├────────────────────────►│                           │
   │                         │                           │
   │ 2. Upload Docs          │                           │
   ├────────────────────────►│                           │
   │                         │                           │
   │                         │ 3. Review & Verify        │
   │◄────────────────────────┤                           │
   │ (notification)          │                           │
   │                         │                           │ 4. Register
   │                         │◄──────────────────────────┤
   │                         │                           │
   │                         │                           │ 5. Browse Students
   │                         │──────────────────────────►│
   │                         │                           │
   │ 6. Sponsorship          │                           │ 6. Sponsor Student
   │◄────────────────────────┼───────────────────────────┤
   │ (notification)          │                           │
   │                         │                           │
   │ 7. Select Institute     │                           │
   ├────────────────────────►│                           │
   │                         │                           │
   │                         │ 8. Add Progress Report    │
   │                         ├──────────────────────────►│
   │                         │                           │ (notification)
   │                         │                           │
   │ 9. View Progress        │                           │ 9. Track Progress
   │◄────────────────────────┼──────────────────────────►│
   │                         │                           │
   │                         │ 10. Issue 80G Certificate │
   │                         ├──────────────────────────►│
   │                         │                           │ (can download)
   ▼                         ▼                           ▼
```

---

## 8. API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login (returns JWT) |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Student APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/profile` | Get student profile |
| POST | `/api/student/upload-document` | Upload verification document |
| PUT | `/api/student/select-institute/{id}` | Select coaching institute |

### Company APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company/students` | Browse verified students |
| GET | `/api/company/sponsored-students` | List sponsored students |
| POST | `/api/company/sponsor` | Create sponsorship |
| GET | `/api/company/tax-compliance` | Tax & 80G data |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/pending-students` | Students pending verification |
| POST | `/api/admin/verify/{student_id}` | Verify a student |
| POST | `/api/admin/progress-report` | Add progress report |
| GET | `/api/admin/csr-partners` | CSR partner management |
| POST | `/api/admin/80g-certificate/{id}` | Issue 80G certificate |

### Public APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/stats` | Platform statistics |
| GET | `/api/public/success-stories` | Success stories |
| GET | `/api/public/leaderboard` | Company leaderboard |

### Notifications & Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| GET | `/api/messages` | Get messages |
| POST | `/api/messages` | Send message |

---

## 9. Database Schema Overview

### Collections
```
users
├── _id, email, password_hash, password_plain, role, name, phone
├── verification_status (for students)
└── company_name (for companies)

students
├── user_id (ref: users)
├── dob, school, class_10_percentage, address
├── documents: { income_cert, marksheet, aadhar }
├── coaching_details: { institute, type, batch_year, ... }
├── funding_details: { total, utilized, breakdown, ... }
├── exam_performance: { mock_tests[], actual_exams[], final_results }
└── sponsorship_id, sponsor_company_id

companies
├── user_id (ref: users)
├── company_name, contact_person
├── impact_score, total_commitment
└── tier

sponsorships
├── student_id, company_id
├── amount, duration, status
└── created_at

notifications
├── user_id, type, title, message
├── is_read, created_at

messages
├── sender_id, receiver_id
├── subject, body, timestamp
├── is_read, is_starred, is_archived

sponsorship_packages
├── company_id, package_name
├── amount, duration, benefits
├── eligibility, slots, status
```

---

## 10. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@csredu.com | Admin@123 |
| Company | sponsor@testcorp.com | Test@12345 |
| Student | mukesh@test.com | Test@12345 |

---

## 11. Security Notes

- JWT-based authentication with 24-hour token expiry
- Password hashing with bcrypt (Note: `password_plain` also stored per admin requirement)
- Role-based access control on all endpoints
- Document uploads stored as base64
- Admin audit logging for credential access

---

*Last Updated: January 2026*
