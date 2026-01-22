from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
from enum import Enum
import resend
import asyncio
import secrets
import csv
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Resend Email Configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

security = HTTPBearer()

# Create the main app
app = FastAPI(title="CSR Education Platform API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    STUDENT = "student"
    COMPANY = "company"
    ADMIN = "admin"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class SponsorshipStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class CoachingType(str, Enum):
    IIT_JEE = "IIT-JEE"
    NEET = "NEET"
    JEE_NEET = "JEE+NEET"
    FOUNDATION = "Foundation"

class ExamType(str, Enum):
    JEE_MAIN = "JEE_MAIN"
    JEE_ADVANCED = "JEE_ADVANCED"
    NEET = "NEET"
    MOCK_TEST = "MOCK_TEST"

class AdmissionStatus(str, Enum):
    ADMITTED = "Admitted"
    WAITLISTED = "Waitlisted"
    NOT_ADMITTED = "Not Admitted"
    PENDING = "Pending"

class PaymentSchedule(str, Enum):
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    SEMESTER = "Semester"
    ANNUAL = "Annual"

# ============= ENHANCED MODELS =============

# Coaching Details Model
class CoachingDetails(BaseModel):
    institute_name: str
    institute_location: str
    coaching_type: CoachingType
    course_duration: str
    batch_year: str
    enrollment_date: str
    expected_exam_date: str

# Funding Breakdown Model
class FundingBreakdown(BaseModel):
    tuition_fees: float = 0
    study_material: float = 0
    test_series: float = 0
    hostel_food: float = 0
    transport: float = 0
    other: float = 0

# Funding Details Model
class FundingDetails(BaseModel):
    total_amount_allocated: float = 0
    amount_per_year: float = 0
    amount_utilized: float = 0
    payment_schedule: PaymentSchedule = PaymentSchedule.QUARTERLY
    sponsored_items: List[str] = []
    funding_breakdown: FundingBreakdown = FundingBreakdown()

# Subject Breakdown Model
class SubjectBreakdown(BaseModel):
    physics: Optional[float] = None
    chemistry: Optional[float] = None
    mathematics: Optional[float] = None
    biology: Optional[float] = None

# Mock Test Model
class MockTest(BaseModel):
    test_id: str = ""
    exam_name: str
    test_date: str
    total_marks: float
    obtained_marks: float
    rank: Optional[int] = None
    percentile: Optional[float] = None
    subject_breakdown: SubjectBreakdown = SubjectBreakdown()

# Actual Exam Model
class ActualExam(BaseModel):
    exam_id: str = ""
    exam_name: str
    exam_type: ExamType
    exam_date: str
    total_marks: float
    obtained_marks: float
    rank: Optional[int] = None
    state_rank: Optional[int] = None
    category_rank: Optional[int] = None
    percentile: Optional[float] = None
    qualified: bool = False
    cutoff_crossed: bool = False
    subject_scores: SubjectBreakdown = SubjectBreakdown()

# Final Result Model
class FinalResult(BaseModel):
    exam_cleared: bool = False
    exam_name: Optional[str] = None
    final_rank: Optional[int] = None
    college_allotted: Optional[str] = None
    branch_course: Optional[str] = None
    admission_status: AdmissionStatus = AdmissionStatus.PENDING
    achievement_date: Optional[str] = None

# Exam Performance Model
class ExamPerformance(BaseModel):
    mock_tests: List[MockTest] = []
    actual_exams: List[ActualExam] = []
    final_result: FinalResult = FinalResult()

# ============= EXISTING MODELS (ENHANCED) =============

class StudentRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    date_of_birth: str
    phone: str
    school_name: str
    class_10_percentage: float
    address: str
    # Optional coaching details during registration
    coaching_details: Optional[CoachingDetails] = None

class CompanyRegister(BaseModel):
    email: EmailStr
    password: str
    company_name: str
    contact_person: str
    phone: str
    industry: str
    website: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class DocumentUpload(BaseModel):
    document_type: str
    document_data: str
    document_name: str

# Enhanced Progress Report Model
class ProgressReport(BaseModel):
    # Monthly performance
    attendance_percentage: Optional[float] = None
    class_rank: Optional[int] = None
    total_in_class: Optional[int] = None
    # Subject scores
    subject_scores: Optional[SubjectBreakdown] = None
    # Mock test in this report
    mock_test: Optional[MockTest] = None
    # Teacher's comment
    report_text: Optional[str] = None
    report_month: str
    # Funding utilized this month
    funding_utilized_this_month: Optional[float] = None
    funding_breakdown_this_month: Optional[Dict[str, float]] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    role: UserRole

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Admin Update Models
class UpdateCoachingDetails(BaseModel):
    student_id: str
    coaching_details: CoachingDetails

class UpdateFundingDetails(BaseModel):
    student_id: str
    funding_details: FundingDetails

class AddMockTest(BaseModel):
    student_id: str
    mock_test: MockTest

class AddActualExam(BaseModel):
    student_id: str
    actual_exam: ActualExam

class UpdateFinalResult(BaseModel):
    student_id: str
    final_result: FinalResult

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# ============= AUTH ROUTES =============

@api_router.post("/auth/student/register")
async def register_student(student: StudentRegister):
    existing = await db.students.find_one({"email": student.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    student_doc = {
        "student_id": str(uuid.uuid4()),
        "email": student.email,
        "password_hash": hash_password(student.password),
        "full_name": student.full_name,
        "date_of_birth": student.date_of_birth,
        "phone": student.phone,
        "school_name": student.school_name,
        "class_10_percentage": student.class_10_percentage,
        "address": student.address,
        "verification_status": VerificationStatus.PENDING,
        "is_sponsored": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        # Enhanced fields - initialized as empty/null
        "coaching_details": student.coaching_details.model_dump() if student.coaching_details else None,
        "funding_details": None,
        "exam_performance": {
            "mock_tests": [],
            "actual_exams": [],
            "final_result": {
                "exam_cleared": False,
                "exam_name": None,
                "final_rank": None,
                "college_allotted": None,
                "branch_course": None,
                "admission_status": "Pending",
                "achievement_date": None
            }
        }
    }
    
    await db.students.insert_one(student_doc)
    token = create_token(student_doc["student_id"], UserRole.STUDENT)
    
    return {
        "success": True,
        "token": token,
        "user": {
            "student_id": student_doc["student_id"],
            "email": student_doc["email"],
            "full_name": student_doc["full_name"]
        }
    }

@api_router.post("/auth/company/register")
async def register_company(company: CompanyRegister):
    existing = await db.companies.find_one({"email": company.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    company_doc = {
        "company_id": str(uuid.uuid4()),
        "email": company.email,
        "password_hash": hash_password(company.password),
        "company_name": company.company_name,
        "contact_person": company.contact_person,
        "phone": company.phone,
        "industry": company.industry,
        "website": company.website,
        "total_sponsored": 0,
        "total_funds_allocated": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.companies.insert_one(company_doc)
    token = create_token(company_doc["company_id"], UserRole.COMPANY)
    
    return {
        "success": True,
        "token": token,
        "user": {
            "company_id": company_doc["company_id"],
            "email": company_doc["email"],
            "company_name": company_doc["company_name"]
        }
    }

@api_router.post("/auth/login")
async def login(login_data: LoginRequest):
    collection = None
    id_field = None
    
    if login_data.role == UserRole.STUDENT:
        collection = db.students
        id_field = "student_id"
    elif login_data.role == UserRole.COMPANY:
        collection = db.companies
        id_field = "company_id"
    elif login_data.role == UserRole.ADMIN:
        collection = db.admins
        id_field = "admin_id"
    
    user = await collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user[id_field], login_data.role)
    
    return {
        "success": True,
        "token": token,
        "role": login_data.role,
        "user_id": user[id_field]
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    collection = None
    name_field = None
    
    if request.role == UserRole.STUDENT:
        collection = db.students
        name_field = "full_name"
    elif request.role == UserRole.COMPANY:
        collection = db.companies
        name_field = "company_name"
    elif request.role == UserRole.ADMIN:
        collection = db.admins
        name_field = "name"
    
    user = await collection.find_one({"email": request.email})
    if not user:
        return {"success": True, "message": "If the email exists, a reset link has been sent"}
    
    reset_token = secrets.token_urlsafe(32)
    reset_token_hash = hash_password(reset_token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "email": request.email,
        "role": request.role,
        "token_hash": reset_token_hash,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    try:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }}
                .button {{ display: inline-block; background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>EduUplift</h1>
                    <p>Password Reset Request</p>
                </div>
                <div class="content">
                    <p>Hello {user.get(name_field, 'User')},</p>
                    <p>We received a request to reset your password for your EduUplift account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #6b7280; font-size: 14px;">{reset_link}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    <p>Best regards,<br>The EduUplift Team</p>
                </div>
                <div class="footer">
                    <p>2025 EduUplift. Empowering dreams through education.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [request.email],
            "subject": "Reset Your EduUplift Password",
            "html": html_content
        }
        
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Password reset email sent to {request.email}, Email ID: {email_result.get('id')}")
        
    except Exception as e:
        logger.error(f"Failed to send reset email: {str(e)}")
    
    return {
        "success": True,
        "message": "If the email exists, a reset link has been sent"
    }

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    reset_records = await db.password_resets.find({"used": False}, {"_id": 0}).to_list(100)
    
    valid_record = None
    for record in reset_records:
        if verify_password(request.token, record["token_hash"]):
            expires_at = datetime.fromisoformat(record["expires_at"])
            if datetime.now(timezone.utc) < expires_at:
                valid_record = record
                break
    
    if not valid_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    collection = None
    if valid_record["role"] == UserRole.STUDENT:
        collection = db.students
    elif valid_record["role"] == UserRole.COMPANY:
        collection = db.companies
    elif valid_record["role"] == UserRole.ADMIN:
        collection = db.admins
    
    await collection.update_one(
        {"email": valid_record["email"]},
        {"$set": {"password_hash": hash_password(request.new_password)}}
    )
    
    await db.password_resets.update_one(
        {"email": valid_record["email"], "token_hash": valid_record["token_hash"]},
        {"$set": {"used": True}}
    )
    
    return {
        "success": True,
        "message": "Password has been reset successfully"
    }

# ============= STUDENT ROUTES =============

@api_router.post("/student/upload-document")
async def upload_document(document: DocumentUpload, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can upload documents")
    
    doc = {
        "doc_id": str(uuid.uuid4()),
        "student_id": current_user['user_id'],
        "document_type": document.document_type,
        "document_data": document.document_data,
        "document_name": document.document_name,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "verification_status": VerificationStatus.PENDING
    }
    
    await db.documents.insert_one(doc)
    return {"success": True, "doc_id": doc["doc_id"]}

@api_router.get("/student/profile")
async def get_student_profile(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    student = await db.students.find_one({"student_id": current_user['user_id']}, {"_id": 0, "password_hash": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    documents = await db.documents.find({"student_id": current_user['user_id']}, {"_id": 0, "document_data": 0}).to_list(100)
    sponsorship = await db.sponsorships.find_one({"student_id": current_user['user_id']}, {"_id": 0})
    reports = await db.progress_reports.find({"student_id": current_user['user_id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Get company name if sponsored
    company_name = None
    if sponsorship:
        company = await db.companies.find_one({"company_id": sponsorship["company_id"]}, {"_id": 0, "company_name": 1})
        company_name = company.get("company_name") if company else None
    
    return {
        "student": student,
        "documents": documents,
        "sponsorship": sponsorship,
        "company_name": company_name,
        "progress_reports": reports
    }

@api_router.put("/student/update-coaching")
async def update_student_coaching(coaching: CoachingDetails, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.students.update_one(
        {"student_id": current_user['user_id']},
        {"$set": {"coaching_details": coaching.model_dump()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True}

# ============= COMPANY ROUTES =============

@api_router.get("/company/students")
async def get_students_list(
    current_user: dict = Depends(verify_token),
    page: int = 1,
    limit: int = 50,
    search: str = None,
    min_percentage: float = None,
    coaching_type: str = None
):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    query = {"verification_status": VerificationStatus.VERIFIED, "is_sponsored": False}
    
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"school_name": {"$regex": search, "$options": "i"}},
            {"coaching_details.institute_name": {"$regex": search, "$options": "i"}}
        ]
    
    if min_percentage:
        query["class_10_percentage"] = {"$gte": min_percentage}
    
    if coaching_type:
        query["coaching_details.coaching_type"] = coaching_type
    
    total = await db.students.count_documents(query)
    skip = (page - 1) * limit
    total_pages = (total + limit - 1) // limit
    
    students = await db.students.find(
        query,
        {"_id": 0, "password_hash": 0}
    ).skip(skip).limit(limit).to_list(None)
    
    return {
        "students": students,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }
    }

@api_router.post("/company/sponsor/{student_id}")
async def sponsor_student(student_id: str, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    student = await db.students.find_one({"student_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if student.get("is_sponsored"):
        raise HTTPException(status_code=400, detail="Student already sponsored")
    
    sponsorship = {
        "sponsorship_id": str(uuid.uuid4()),
        "student_id": student_id,
        "company_id": current_user['user_id'],
        "status": SponsorshipStatus.ACTIVE,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "payment_status": "pending",
        "rtgs_reference": None
    }
    
    await db.sponsorships.insert_one(sponsorship)
    
    await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"is_sponsored": True}}
    )
    
    await db.companies.update_one(
        {"company_id": current_user['user_id']},
        {"$inc": {"total_sponsored": 1}}
    )
    
    return {"success": True, "sponsorship_id": sponsorship["sponsorship_id"]}

@api_router.get("/company/sponsored-students")
async def get_sponsored_students(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    sponsorships = await db.sponsorships.find({"company_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    
    if not sponsorships:
        return {"sponsored_students": []}
    
    student_ids = [s["student_id"] for s in sponsorships]
    
    students_list = await db.students.find(
        {"student_id": {"$in": student_ids}}, 
        {"_id": 0, "password_hash": 0}
    ).to_list(None)
    students_dict = {s["student_id"]: s for s in students_list}
    
    all_reports = await db.progress_reports.find(
        {"student_id": {"$in": student_ids}}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(None)
    
    reports_dict = {}
    for report in all_reports:
        sid = report["student_id"]
        if sid not in reports_dict:
            reports_dict[sid] = []
        reports_dict[sid].append(report)
    
    result = []
    for sponsorship in sponsorships:
        sid = sponsorship["student_id"]
        result.append({
            "sponsorship": sponsorship,
            "student": students_dict.get(sid),
            "progress_reports": reports_dict.get(sid, [])
        })
    
    return {"sponsored_students": result}

@api_router.put("/company/payment/{sponsorship_id}")
async def update_payment(sponsorship_id: str, rtgs_reference: str = Form(...), current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.sponsorships.update_one(
        {"sponsorship_id": sponsorship_id, "company_id": current_user['user_id']},
        {"$set": {"payment_status": "completed", "rtgs_reference": rtgs_reference}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Sponsorship not found")
    
    return {"success": True}

@api_router.get("/company/profile")
async def get_company_profile(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    company = await db.companies.find_one({"company_id": current_user['user_id']}, {"_id": 0, "password_hash": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return {"company": company}

# ============= ADMIN ROUTES =============

@api_router.get("/admin/pending-students")
async def get_pending_students(
    current_user: dict = Depends(verify_token),
    page: int = 1,
    limit: int = 50,
    search: str = None,
    status: str = "pending"
):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    query = {}
    if status == "pending":
        query["verification_status"] = VerificationStatus.PENDING
    elif status == "verified":
        query["verification_status"] = VerificationStatus.VERIFIED
    elif status == "all":
        pass
    
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"school_name": {"$regex": search, "$options": "i"}}
        ]
    
    total = await db.students.count_documents(query)
    skip = (page - 1) * limit
    total_pages = (total + limit - 1) // limit
    
    students = await db.students.find(
        query,
        {"_id": 0, "password_hash": 0}
    ).skip(skip).limit(limit).to_list(None)
    
    if not students:
        return {
            "pending_students": [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": 0,
                "total_pages": 0
            }
        }
    
    student_ids = [s["student_id"] for s in students]
    all_documents = await db.documents.find(
        {"student_id": {"$in": student_ids}}, 
        {"_id": 0}
    ).to_list(None)
    
    docs_dict = {}
    for doc in all_documents:
        sid = doc["student_id"]
        if sid not in docs_dict:
            docs_dict[sid] = []
        docs_dict[sid].append(doc)
    
    result = []
    for student in students:
        result.append({
            "student": student,
            "documents": docs_dict.get(student["student_id"], [])
        })
    
    return {
        "pending_students": result,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }
    }

@api_router.put("/admin/verify-student/{student_id}")
async def verify_student(student_id: str, approved: bool = Form(...), current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    new_status = VerificationStatus.VERIFIED if approved else VerificationStatus.REJECTED
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"verification_status": new_status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True}

@api_router.put("/admin/bulk-verify-students")
async def bulk_verify_students(
    student_ids: List[str] = Form(...),
    approved: bool = Form(...),
    current_user: dict = Depends(verify_token)
):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    new_status = VerificationStatus.VERIFIED if approved else VerificationStatus.REJECTED
    
    result = await db.students.update_many(
        {"student_id": {"$in": student_ids}},
        {"$set": {"verification_status": new_status}}
    )
    
    return {
        "success": True,
        "modified_count": result.modified_count,
        "status": new_status
    }

# Enhanced Progress Report endpoint
@api_router.post("/admin/progress-report/{student_id}")
async def add_progress_report(student_id: str, report: ProgressReport, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Verify student exists and is sponsored
    student = await db.students.find_one({"student_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if not student.get("is_sponsored"):
        raise HTTPException(status_code=400, detail="Student must be sponsored to add progress reports")
    
    report_doc = {
        "report_id": str(uuid.uuid4()),
        "student_id": student_id,
        "attendance_percentage": report.attendance_percentage,
        "class_rank": report.class_rank,
        "total_in_class": report.total_in_class,
        "subject_scores": report.subject_scores.model_dump() if report.subject_scores else None,
        "mock_test": report.mock_test.model_dump() if report.mock_test else None,
        "report_text": report.report_text,
        "report_month": report.report_month,
        "funding_utilized_this_month": report.funding_utilized_this_month,
        "funding_breakdown_this_month": report.funding_breakdown_this_month,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.progress_reports.insert_one(report_doc)
    
    # If mock test is included, also add it to student's exam_performance
    if report.mock_test:
        mock_test_data = report.mock_test.model_dump()
        mock_test_data["test_id"] = str(uuid.uuid4())
        await db.students.update_one(
            {"student_id": student_id},
            {"$push": {"exam_performance.mock_tests": mock_test_data}}
        )
    
    # Update funding utilization if provided
    if report.funding_utilized_this_month:
        await db.students.update_one(
            {"student_id": student_id},
            {"$inc": {"funding_details.amount_utilized": report.funding_utilized_this_month}}
        )
    
    return {"success": True, "report_id": report_doc["report_id"]}

# Update Coaching Details
@api_router.put("/admin/student/coaching/{student_id}")
async def admin_update_coaching(student_id: str, coaching: CoachingDetails, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"coaching_details": coaching.model_dump()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True}

# Update Funding Details
@api_router.put("/admin/student/funding/{student_id}")
async def admin_update_funding(student_id: str, funding: FundingDetails, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"funding_details": funding.model_dump()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True}

# Add Mock Test
@api_router.post("/admin/student/mock-test/{student_id}")
async def admin_add_mock_test(student_id: str, mock_test: MockTest, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    mock_test_data = mock_test.model_dump()
    mock_test_data["test_id"] = str(uuid.uuid4())
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$push": {"exam_performance.mock_tests": mock_test_data}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True, "test_id": mock_test_data["test_id"]}

# Add Actual Exam
@api_router.post("/admin/student/actual-exam/{student_id}")
async def admin_add_actual_exam(student_id: str, actual_exam: ActualExam, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    exam_data = actual_exam.model_dump()
    exam_data["exam_id"] = str(uuid.uuid4())
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$push": {"exam_performance.actual_exams": exam_data}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True, "exam_id": exam_data["exam_id"]}

# Update Final Result
@api_router.put("/admin/student/final-result/{student_id}")
async def admin_update_final_result(student_id: str, final_result: FinalResult, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"exam_performance.final_result": final_result.model_dump()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True}

# Get single student details (for admin)
@api_router.get("/admin/student/{student_id}")
async def get_student_details(student_id: str, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0, "password_hash": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    documents = await db.documents.find({"student_id": student_id}, {"_id": 0, "document_data": 0}).to_list(100)
    sponsorship = await db.sponsorships.find_one({"student_id": student_id}, {"_id": 0})
    reports = await db.progress_reports.find({"student_id": student_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    company_name = None
    if sponsorship:
        company = await db.companies.find_one({"company_id": sponsorship["company_id"]}, {"_id": 0, "company_name": 1})
        company_name = company.get("company_name") if company else None
    
    return {
        "student": student,
        "documents": documents,
        "sponsorship": sponsorship,
        "company_name": company_name,
        "progress_reports": reports
    }

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    total_students = await db.students.count_documents({})
    verified_students = await db.students.count_documents({"verification_status": VerificationStatus.VERIFIED})
    pending_students = await db.students.count_documents({"verification_status": VerificationStatus.PENDING})
    sponsored_students = await db.students.count_documents({"is_sponsored": True})
    total_companies = await db.companies.count_documents({})
    active_sponsorships = await db.sponsorships.count_documents({"status": SponsorshipStatus.ACTIVE})
    
    # Count by coaching type
    jee_students = await db.students.count_documents({"coaching_details.coaching_type": "IIT-JEE"})
    neet_students = await db.students.count_documents({"coaching_details.coaching_type": "NEET"})
    
    return {
        "total_students": total_students,
        "verified_students": verified_students,
        "pending_students": pending_students,
        "sponsored_students": sponsored_students,
        "total_companies": total_companies,
        "active_sponsorships": active_sponsorships,
        "jee_students": jee_students,
        "neet_students": neet_students
    }

@api_router.get("/admin/sponsored-students")
async def get_sponsored_students_admin(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    students = await db.students.find(
        {"is_sponsored": True},
        {"_id": 0, "password_hash": 0}
    ).to_list(None)
    
    if not students:
        return {"sponsored_students": []}
    
    student_ids = [s["student_id"] for s in students]
    
    sponsorships = await db.sponsorships.find(
        {"student_id": {"$in": student_ids}},
        {"_id": 0}
    ).to_list(None)
    
    sponsorships_dict = {s["student_id"]: s for s in sponsorships}
    
    company_ids = [s["company_id"] for s in sponsorships]
    companies = await db.companies.find(
        {"company_id": {"$in": company_ids}},
        {"_id": 0, "company_name": 1, "company_id": 1}
    ).to_list(None)
    
    companies_dict = {c["company_id"]: c for c in companies}
    
    result = []
    for student in students:
        sid = student["student_id"]
        sponsorship = sponsorships_dict.get(sid)
        company = companies_dict.get(sponsorship["company_id"]) if sponsorship else None
        
        result.append({
            "student": student,
            "sponsorship": sponsorship,
            "company_name": company.get("company_name") if company else "Unknown"
        })
    
    return {"sponsored_students": result}

# CSV Bulk Import
@api_router.post("/admin/bulk-import/progress-reports")
async def bulk_import_progress_reports(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token)
):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    success_count = 0
    error_count = 0
    errors = []
    
    for row in reader:
        try:
            student_id = row.get('student_id')
            if not student_id:
                error_count += 1
                errors.append(f"Missing student_id in row")
                continue
            
            # Verify student exists
            student = await db.students.find_one({"student_id": student_id})
            if not student:
                error_count += 1
                errors.append(f"Student not found: {student_id}")
                continue
            
            report_doc = {
                "report_id": str(uuid.uuid4()),
                "student_id": student_id,
                "attendance_percentage": float(row.get('attendance_percentage', 0)) if row.get('attendance_percentage') else None,
                "class_rank": int(row.get('class_rank', 0)) if row.get('class_rank') else None,
                "total_in_class": int(row.get('total_in_class', 0)) if row.get('total_in_class') else None,
                "subject_scores": {
                    "physics": float(row.get('physics_score', 0)) if row.get('physics_score') else None,
                    "chemistry": float(row.get('chemistry_score', 0)) if row.get('chemistry_score') else None,
                    "mathematics": float(row.get('mathematics_score', 0)) if row.get('mathematics_score') else None,
                    "biology": float(row.get('biology_score', 0)) if row.get('biology_score') else None,
                },
                "report_text": row.get('report_text', ''),
                "report_month": row.get('report_month', ''),
                "funding_utilized_this_month": float(row.get('funding_utilized', 0)) if row.get('funding_utilized') else None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.progress_reports.insert_one(report_doc)
            success_count += 1
            
        except Exception as e:
            error_count += 1
            errors.append(str(e))
    
    return {
        "success": True,
        "success_count": success_count,
        "error_count": error_count,
        "errors": errors[:10]  # Return first 10 errors
    }

# ============= PUBLIC ROUTES =============

@api_router.get("/public/stats")
async def get_public_stats():
    total_students = await db.students.count_documents({"verification_status": VerificationStatus.VERIFIED})
    sponsored_students = await db.students.count_documents({"is_sponsored": True})
    total_companies = await db.companies.count_documents({})
    
    # Calculate total funds
    pipeline = [
        {"$match": {"funding_details": {"$ne": None}}},
        {"$group": {"_id": None, "total": {"$sum": "$funding_details.total_amount_allocated"}}}
    ]
    result = await db.students.aggregate(pipeline).to_list(1)
    total_funds = result[0]["total"] if result else 0
    
    return {
        "total_students": total_students,
        "sponsored_students": sponsored_students,
        "total_companies": total_companies,
        "total_funds_allocated": total_funds,
        "impact": {
            "lives_changed": sponsored_students,
            "companies_participating": total_companies
        }
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def create_admin_user():
    admin = await db.admins.find_one({"email": "admin@csredu.com"})
    if not admin:
        admin_doc = {
            "admin_id": str(uuid.uuid4()),
            "email": "admin@csredu.com",
            "password_hash": hash_password("Admin@123"),
            "name": "System Admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(admin_doc)
        logger.info("Default admin created: admin@csredu.com / Admin@123")
