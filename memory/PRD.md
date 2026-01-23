# EduUplift - CSR Education Platform

## Product Requirements Document (PRD)

### Original Problem Statement
Build a website for raising Corporate Social Responsibility (CSR) funds in India to support underprivileged students in government schools preparing for IIT/NEET coaching.

### Core Features Implemented

#### 1. User Roles
- **Students**: Create accounts, upload verification documents, view sponsorship status, select institutes, track progress
- **Companies**: Create accounts, browse verified students, sponsor students, track progress, view tax compliance & 80G certificates
- **Admin**: Verify students, manage student data, add progress reports, manage CSR partners, issue 80G certificates

#### 2. Student Profile System (Enhanced)
- Basic Info: Name, DOB, Phone, Email, School, Class 10 percentage, Address
- **Coaching Details**: Institute name/location, coaching type, batch year, target exam date
- **Funding Allocation**: Total amount, utilized, breakdown by category, payment schedule
- **Exam Performance**: Mock tests, actual exams, final results with college allotment

#### 3. Student Dashboard States
- **Pending Verification**: Shows application status, waiting for admin review
- **Awaiting Sponsorship**: Profile verified, visible to companies, profile view count
- **Pending Institute Selection**: Just sponsored, must select coaching institute from available options
- **Enrolled**: Institute selected, full dashboard with progress tracking

#### 4. Institute Selection Feature
- Students can choose from available coaching institutes after sponsorship
- Institute cards show: Name, Location, Rating, Success Rate, Features, Fee, Hostel availability
- Budget tracking - shows remaining amount after institute selection
- Confirmation flow with admin notification

#### 5. Success Stories Section
- Public-facing section on landing page
- Displays student achievements (AIR rank, college, branch, year)
- Coaching institute details
- Company sponsor information with testimonial
- "Dreams Turned Into Reality" theme

#### 6. CSR Partners Management (Admin)
- Overview metrics: Companies, Students, Total Funds, Utilization Rate
- Company cards with tier badges (Premium, Gold, Silver, Standard)
- Impact score calculation
- Fund utilization tracking
- 80G certificate management
- Partnership details (start/end date, tier, admin fee)

#### 7. Tax & Compliance (Company)
- Financial Summary - FY view
- CSR Commitment vs Disbursed amounts
- Tax Benefit (80G - 50%) calculation
- Fund utilization breakdown
- 80G certificate download
- Important tax information guidance

### Technical Stack
- **Frontend**: React, Tailwind CSS, shadcn/ui components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Email**: Resend (for forgot password)

### New API Endpoints

#### Institutes
- `GET /api/institutes` - Get available coaching institutes
- `POST /api/admin/institutes` - Admin adds new institute
- `PUT /api/student/select-institute/{institute_id}` - Student selects institute

#### Success Stories
- `GET /api/public/success-stories` - Get published success stories
- `POST /api/admin/success-stories` - Admin creates success story
- `DELETE /api/admin/success-stories/{story_id}` - Admin deletes story

#### CSR Management
- `GET /api/admin/csr-partners` - Get all CSR partners with metrics
- `POST /api/admin/csr-partnership/{company_id}` - Update partnership details
- `POST /api/admin/80g-certificate/{company_id}` - Issue 80G certificate
- `GET /api/company/tax-compliance` - Get tax compliance data

### Database Collections
- `institutes` - Coaching institute details
- `success_stories` - Published success stories
- `csr_partnerships` - Partnership details per company
- `certificates_80g` - Issued 80G certificates

### Test Credentials
- **Admin**: admin@csredu.com / Admin@123
- **Company**: sponsor@testcorp.com / Test@12345
- **Student**: mukesh@test.com / Test@12345

---

## Changelog

### January 23, 2026 (Session 4) - Major Feature Expansion
- **Notification System** (NEW)
  - Real-time notification bell in all dashboards
  - Notification types: verification, sponsorship, document, progress, message, system, payment
  - Mark as read, delete, view all functionality
  - Auto-polling for new notifications every 30 seconds

- **Messaging System** (NEW)
  - Internal messaging between users (student ↔ company ↔ admin)
  - Inbox, Sent, Starred, Archived folders
  - Thread-based conversations with reply functionality
  - Message search and pagination

- **Advanced Search & Filtering** (NEW)
  - Company: Advanced student search with filters (score, exam, location, gender, age, availability)
  - Student: Company browsing with filters (industry, sponsorship type, amount)

- **Sponsorship Packages** (NEW)
  - Companies can create structured sponsorship packages
  - Benefits breakdown (tuition, coaching, books, stipend, hostel)
  - Eligibility criteria (min score, target exam, max income)
  - Slot management and package status (active/paused/closed)

- **Sponsorship Agreements** (NEW)
  - Digital agreement workflow: Company → Student → Admin approval
  - Agreement status tracking
  - Auto-creation of sponsorship record upon approval

- **Analytics Dashboard** (NEW)
  - Admin: Platform-wide analytics (students, companies, funds, trends)
  - Company: Impact analytics (sponsored students, invested funds, performance tracking)
  - Monthly trend visualization
  - Conversion rate metrics

### January 22, 2026 (Session 3) - Deployment Fixes & UI Improvements
- **Deployment Blockers Resolved**
  - Removed unused AI/ML dependencies (google-generativeai, huggingface_hub, hf-xet)
  - Added `data-testid="login-submit-button"` to Login page submit button
  - Added `/api/health` health check endpoint
  - All deployment checks passed via deployment_agent
- **UI Bug Fixes**
  - Fixed DOB field in student registration - now uses proper calendar date picker with month/year dropdowns
  - Fixed homepage header to show logged-in state (Dashboard & Logout buttons instead of Login & Get Started)
- **Admin Credential Management Feature** (NEW)
  - Added "User Credentials" tab to Admin Dashboard
  - View student and company login credentials (email + plain text password)
  - Search and filter by name, email, phone, status
  - Show/hide password toggle with copy functionality
  - Password reset with auto-generate option
  - Send credentials email to users
  - Lock/unlock account functionality
  - Audit logging for all credential access
  - Backend stores plain text passwords for new registrations

### January 22, 2026 (Session 2)
- **Success Stories Feature**
  - Created SuccessStories component with beautiful dark theme design
  - Displays AIR rank, college, branch, coaching details, sponsor testimonial
  - Added to landing page before CTA section
- **Institute Selection Feature**
  - Created InstituteSelection component with budget tracking
  - Students can select institute after being sponsored
  - Shows fee, rating, success rate, features
  - Remaining budget calculation
- **Student Dashboard States**
  - Added Application Status timeline (Registered → Verified → Sponsored → Enrolled)
  - Different UI for each state
  - Institute selection prompt when sponsored
- **CSR Partners Tab (Admin)**
  - Created CSRPartners component
  - Overview metrics cards
  - Company cards with tier badges and impact scores
  - Expandable details (contact, 80G certs, partnership)
- **Tax & Compliance Tab (Company)**
  - Created TaxCompliance component
  - Financial summary with FY
  - Fund utilization progress
  - 80G certificate list with download
  - Tax benefit calculation (50% of donation)
- **Company Leaderboard Feature** ⭐ NEW
  - Public leaderboard on landing page
  - Tier system: Diamond, Platinum, Gold, Silver, Bronze
  - Impact Score formula: (Students × 100) + (Funds ÷ 1000) + (Success × 500)
  - Top 3 podium with crown/medal icons
  - Single company "Founding Champion" display
  - Responsive design for 1, 2, or 3+ companies
- **Backend Enhancements**
  - Added Institute, SuccessStory, Certificate80G, CSRPartnership models
  - 12+ new API endpoints for all features
  - Public leaderboard endpoint with tier calculation
  - Enhanced student profile API with dashboard status

### January 22, 2026 (Session 1)
- Enhanced Data Model Implementation
- Coaching, Funding, and Exam Tracking
- Admin management forms (5-tab interface)
- Progress timeline component

---

## Roadmap

### Completed ✅
- Core platform with multi-role authentication
- Enhanced data model (coaching, funding, exams)
- Success Stories feature
- Institute Selection flow
- CSR Partners management
- Tax & Compliance dashboard
- Company Leaderboard on landing page
- Deployment readiness (health check, test IDs, clean dependencies)

### P1 - Next Priority
- [ ] Phase 2 Scalability - Searchable/paginated student list in Admin Dashboard
- [ ] Progress Report Visibility Bug - Verify company can see admin-added reports
- [ ] DigiLocker Integration for document verification

### P2 - Future
- [ ] PDF export for progress reports
- [ ] Advanced analytics with charts
- [ ] Email notifications for status changes
- [ ] Profile picture upload

### P3 - Backlog
- [ ] Real-time notifications (WebSockets)
- [ ] Bulk CSV import for institutes/students
- [ ] Multi-language support
- [ ] Mobile responsive optimization
