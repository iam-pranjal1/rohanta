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
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
from enum import Enum
import resend
import asyncio
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']  # Required environment variable
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

# Models
class StudentRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    date_of_birth: str
    phone: str
    school_name: str
    class_10_percentage: float
    address: str

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
    document_type: str  # "income_certificate", "class_10_certificate", "aadhar"
    document_data: str  # base64 encoded
    document_name: str

class ProgressReport(BaseModel):
    test_scores: Optional[dict] = None
    attendance_percentage: Optional[float] = None
    report_text: Optional[str] = None
    report_month: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    role: UserRole

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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

# Auth Routes
@api_router.post("/auth/student/register")
async def register_student(student: StudentRegister):
    # Check if student exists
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
        "created_at": datetime.now(timezone.utc).isoformat()
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
    """Send password reset email"""
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
        # Don't reveal if email exists
        return {"success": True, "message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_token_hash = hash_password(reset_token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token in database
    await db.password_resets.insert_one({
        "email": request.email,
        "role": request.role,
        "token_hash": reset_token_hash,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Create reset link
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Send email using Resend
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
                    <h1>🎓 EduUplift</h1>
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
                    <p>© 2025 EduUplift. Empowering dreams through education.</p>
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
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Password reset email sent to {request.email}, Email ID: {email_result.get('id')}")
        
    except Exception as e:
        logger.error(f"Failed to send reset email: {str(e)}")
        # Don't fail the request if email fails, token is still valid
    
    return {
        "success": True,
        "message": "If the email exists, a reset link has been sent"
    }

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    
    # Find valid reset token
    reset_records = await db.password_resets.find({"used": False}, {"_id": 0}).to_list(100)
    
    valid_record = None
    for record in reset_records:
        if verify_password(request.token, record["token_hash"]):
            # Check if token is expired
            expires_at = datetime.fromisoformat(record["expires_at"])
            if datetime.now(timezone.utc) < expires_at:
                valid_record = record
                break
    
    if not valid_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Validate new password
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    # Update password in appropriate collection
    collection = None
    if valid_record["role"] == UserRole.STUDENT:
        collection = db.students
    elif valid_record["role"] == UserRole.COMPANY:
        collection = db.companies
    elif valid_record["role"] == UserRole.ADMIN:
        collection = db.admins
    
    # Update password
    await collection.update_one(
        {"email": valid_record["email"]},
        {"$set": {"password_hash": hash_password(request.new_password)}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"email": valid_record["email"], "token_hash": valid_record["token_hash"]},
        {"$set": {"used": True}}
    )
    
    return {
        "success": True,
        "message": "Password has been reset successfully"
    }

# Student Routes
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
    
    # Get documents
    documents = await db.documents.find({"student_id": current_user['user_id']}, {"_id": 0, "document_data": 0}).to_list(100)
    
    # Get sponsorship
    sponsorship = await db.sponsorships.find_one({"student_id": current_user['user_id']}, {"_id": 0})
    
    # Get progress reports
    reports = await db.progress_reports.find({"student_id": current_user['user_id']}, {"_id": 0}).to_list(100)
    
    return {
        "student": student,
        "documents": documents,
        "sponsorship": sponsorship,
        "progress_reports": reports
    }

# Company Routes
@api_router.get("/company/students")
async def get_students_list(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Get verified students who are not sponsored
    students = await db.students.find(
        {"verification_status": VerificationStatus.VERIFIED, "is_sponsored": False},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    
    return {"students": students}

@api_router.post("/company/sponsor/{student_id}")
async def sponsor_student(student_id: str, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Check if student exists and is available
    student = await db.students.find_one({"student_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if student.get("is_sponsored"):
        raise HTTPException(status_code=400, detail="Student already sponsored")
    
    # Create sponsorship
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
    
    # Update student status
    await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"is_sponsored": True}}
    )
    
    # Update company stats
    await db.companies.update_one(
        {"company_id": current_user['user_id']},
        {"$inc": {"total_sponsored": 1}}
    )
    
    return {"success": True, "sponsorship_id": sponsorship["sponsorship_id"]}

@api_router.get("/company/sponsored-students")
async def get_sponsored_students(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Get all sponsorships by this company
    sponsorships = await db.sponsorships.find({"company_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    
    if not sponsorships:
        return {"sponsored_students": []}
    
    # Batch fetch all students and reports to avoid N+1 queries
    student_ids = [s["student_id"] for s in sponsorships]
    
    # Single query to get all students
    students_list = await db.students.find(
        {"student_id": {"$in": student_ids}}, 
        {"_id": 0, "password_hash": 0}
    ).to_list(None)
    students_dict = {s["student_id"]: s for s in students_list}
    
    # Single query to get all progress reports
    all_reports = await db.progress_reports.find(
        {"student_id": {"$in": student_ids}}, 
        {"_id": 0}
    ).to_list(None)
    
    # Group reports by student_id
    reports_dict = {}
    for report in all_reports:
        sid = report["student_id"]
        if sid not in reports_dict:
            reports_dict[sid] = []
        reports_dict[sid].append(report)
    
    # Build result
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

# Admin Routes
@api_router.get("/admin/pending-students")
async def get_pending_students(current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    students = await db.students.find(
        {"verification_status": VerificationStatus.PENDING},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    
    # Get documents for each student
    result = []
    for student in students:
        documents = await db.documents.find({"student_id": student["student_id"]}, {"_id": 0}).to_list(100)
        result.append({
            "student": student,
            "documents": documents
        })
    
    return {"pending_students": result}

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

@api_router.post("/admin/progress-report/{student_id}")
async def add_progress_report(student_id: str, report: ProgressReport, current_user: dict = Depends(verify_token)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    report_doc = {
        "report_id": str(uuid.uuid4()),
        "student_id": student_id,
        "test_scores": report.test_scores,
        "attendance_percentage": report.attendance_percentage,
        "report_text": report.report_text,
        "report_month": report.report_month,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.progress_reports.insert_one(report_doc)
    
    return {"success": True, "report_id": report_doc["report_id"]}

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
    
    return {
        "total_students": total_students,
        "verified_students": verified_students,
        "pending_students": pending_students,
        "sponsored_students": sponsored_students,
        "total_companies": total_companies,
        "active_sponsorships": active_sponsorships
    }

# Public Routes
@api_router.get("/public/stats")
async def get_public_stats():
    total_students = await db.students.count_documents({"verification_status": VerificationStatus.VERIFIED})
    sponsored_students = await db.students.count_documents({"is_sponsored": True})
    total_companies = await db.companies.count_documents({})
    
    return {
        "total_students": total_students,
        "sponsored_students": sponsored_students,
        "total_companies": total_companies,
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
    # Create default admin if not exists
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