# EduUplift - CSR Education Platform

## Product Requirements Document (PRD)

### Original Problem Statement
Build a website for raising Corporate Social Responsibility (CSR) funds in India to support underprivileged students in government schools preparing for IIT/NEET coaching.

### Core Features Implemented

#### 1. User Roles
- **Students**: Create accounts, upload verification documents, view sponsorship status and progress
- **Companies**: Create accounts, browse verified students, sponsor students, track progress
- **Admin**: Verify students, manage student data, add progress reports

#### 2. Student Profile System (Enhanced)
- Basic Info: Name, DOB, Phone, Email, School, Class 10 percentage, Address
- **Coaching Details**:
  - Institute name and location
  - Coaching type (IIT-JEE, NEET, JEE+NEET, Foundation)
  - Course duration, batch year, enrollment date
  - Target exam date
- **Funding Allocation**:
  - Total amount allocated, amount per year, amount utilized
  - Payment schedule (Monthly/Quarterly/Semester/Annual)
  - Funding breakdown (Tuition, Study Material, Test Series, Hostel, Transport, Other)
- **Exam Performance**:
  - Mock test history with scores, ranks, percentiles, subject breakdown
  - Actual exam results (JEE Main, JEE Advanced, NEET)
  - Final result with college allotment details

#### 3. Progress Tracking System
- Monthly progress reports with:
  - Attendance percentage
  - Class rank
  - Subject-wise scores
  - Mock test results
  - Funding utilization
  - Teacher's comments
- Expandable timeline UI

#### 4. Admin Management Interface
- **Verify Students Tab**: Review pending students and approve/reject
- **Add Progress Tab**: Add monthly progress reports for sponsored students
- **Manage Student Tab**: Update coaching, funding, mock tests, actual exams, final results
- **Sponsored Tab**: View all sponsored students with their profiles

#### 5. Company Dashboard
- Browse verified students with filters (percentage, coaching type)
- Sponsor students
- View sponsored students with full progress timeline
- Track impact metrics

### Technical Stack
- **Frontend**: React, Tailwind CSS, shadcn/ui components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Email**: Resend (for forgot password)

### API Endpoints

#### Authentication
- `POST /api/auth/student/register`
- `POST /api/auth/company/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

#### Student Routes
- `GET /api/student/profile`
- `POST /api/student/upload-document`
- `PUT /api/student/update-coaching`

#### Company Routes
- `GET /api/company/students`
- `POST /api/company/sponsor/{student_id}`
- `GET /api/company/sponsored-students`
- `GET /api/company/profile`

#### Admin Routes
- `GET /api/admin/stats`
- `GET /api/admin/pending-students`
- `GET /api/admin/sponsored-students`
- `GET /api/admin/student/{student_id}`
- `PUT /api/admin/verify-student/{student_id}`
- `PUT /api/admin/bulk-verify-students`
- `POST /api/admin/progress-report/{student_id}`
- `PUT /api/admin/student/coaching/{student_id}`
- `PUT /api/admin/student/funding/{student_id}`
- `POST /api/admin/student/mock-test/{student_id}`
- `POST /api/admin/student/actual-exam/{student_id}`
- `PUT /api/admin/student/final-result/{student_id}`
- `POST /api/admin/bulk-import/progress-reports`

### Database Schema

#### students
```
{
  student_id, email, password_hash, full_name, date_of_birth, phone,
  school_name, class_10_percentage, address, verification_status,
  is_sponsored, created_at,
  coaching_details: { institute_name, institute_location, coaching_type, ... },
  funding_details: { total_amount_allocated, amount_utilized, funding_breakdown, ... },
  exam_performance: { mock_tests: [], actual_exams: [], final_result: {} }
}
```

#### companies
```
{
  company_id, email, password_hash, company_name, contact_person,
  phone, industry, website, total_sponsored, total_funds_allocated
}
```

#### sponsorships
```
{
  sponsorship_id, student_id, company_id, status, start_date, 
  payment_status, rtgs_reference
}
```

#### progress_reports
```
{
  report_id, student_id, attendance_percentage, class_rank, total_in_class,
  subject_scores, mock_test, report_text, report_month,
  funding_utilized_this_month, created_at
}
```

### Test Credentials
- **Admin**: admin@csredu.com / Admin@123
- **Company**: sponsor@testcorp.com / Test@12345
- **Student**: mukesh@test.com / Test@12345

---

## Changelog

### January 22, 2026
- **Enhanced Data Model Implementation**
  - Added coaching details (institute, type, duration, batch, target exam)
  - Added funding allocation with breakdown and utilization tracking
  - Added mock test and actual exam tracking
  - Added final result with college allotment
  - Created AdminStudentForms component with 5-tab interface
  - Created StudentProfileCard component with expandable sections
  - Created EnhancedProgressTimeline component
  - Updated all dashboards (Student, Company, Admin)
  - Fixed MongoDB projection error in sponsored students API
  - All 23 backend tests passing

### Previous Session
- Core platform with Student/Company/Admin roles
- JWT authentication
- Forgot password with Resend email
- UI/UX improvements with password strength indicator
- Phase 1 scalability (pagination, search)
- Bug fixes (N+1 query, date input UX)

---

## Roadmap

### P0 - Completed
- ✅ Enhanced data model with coaching, funding, exams

### P1 - Next Priority
- [ ] DigiLocker Integration for document verification
- [ ] Company Dashboard scalability (lazy loading, mobile responsive)

### P2 - Future
- [ ] PDF export for progress reports
- [ ] Advanced filtering system
- [ ] Profile picture upload
- [ ] Charts and analytics for exam trends

### P3 - Backlog
- [ ] Real-time notifications (WebSockets)
- [ ] Bulk CSV import for progress reports
- [ ] Student comparison tools
