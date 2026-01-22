"""
CSR Education Platform - Backend API Tests
Tests for Student, Company, and Admin flows including:
- Authentication (login/register)
- Student verification
- Coaching, Funding, Mock Test management
- Progress reports
- Company sponsorship
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from the review request
ADMIN_CREDS = {"email": "admin@csredu.com", "password": "Admin@123", "role": "admin"}
COMPANY_CREDS = {"email": "sponsor@testcorp.com", "password": "Test@12345", "role": "company"}
STUDENT_CREDS = {"email": "mukesh@test.com", "password": "Test@12345", "role": "student"}
STUDENT_ID = "0091a39c-4f06-4d89-ad3a-7b2120c8ccec"


class TestPublicEndpoints:
    """Test public endpoints that don't require authentication"""
    
    def test_public_stats(self):
        """Test public stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/public/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "sponsored_students" in data
        assert "total_companies" in data
        assert "total_funds_allocated" in data
        print(f"Public stats: {data}")


class TestAuthentication:
    """Test authentication flows for all user types"""
    
    def test_admin_login(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["role"] == "admin"
        print(f"Admin login successful, user_id: {data['user_id']}")
    
    def test_company_login(self):
        """Test company login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=COMPANY_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["role"] == "company"
        print(f"Company login successful, user_id: {data['user_id']}")
    
    def test_student_login(self):
        """Test student login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=STUDENT_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["role"] == "student"
        print(f"Student login successful, user_id: {data['user_id']}")
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword",
            "role": "student"
        })
        assert response.status_code == 401
        print("Invalid login correctly rejected")
    
    def test_student_registration(self):
        """Test new student registration"""
        unique_email = f"TEST_student_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/student/register", json={
            "email": unique_email,
            "password": "Test@12345",
            "full_name": "TEST Student Registration",
            "date_of_birth": "2005-01-15",
            "phone": "9876543210",
            "school_name": "Test High School",
            "class_10_percentage": 85.5,
            "address": "Test Address, City"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        print(f"Student registration successful: {data['user']['student_id']}")
    
    def test_company_registration(self):
        """Test new company registration"""
        unique_email = f"TEST_company_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/company/register", json={
            "email": unique_email,
            "password": "Test@12345",
            "company_name": "TEST Company Registration",
            "contact_person": "Test Contact",
            "phone": "9876543210",
            "industry": "Technology"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        print(f"Company registration successful: {data['user']['company_id']}")


class TestAdminDashboard:
    """Test admin dashboard functionality"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_stats(self, admin_token):
        """Test admin stats endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "verified_students" in data
        assert "pending_students" in data
        assert "sponsored_students" in data
        assert "total_companies" in data
        print(f"Admin stats: {data}")
    
    def test_get_pending_students(self, admin_token):
        """Test getting pending students list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/pending-students?status=all", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "pending_students" in data
        assert "pagination" in data
        print(f"Found {len(data['pending_students'])} students")
    
    def test_get_sponsored_students_admin(self, admin_token):
        """Test getting sponsored students list for admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/sponsored-students", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "sponsored_students" in data
        print(f"Found {len(data['sponsored_students'])} sponsored students")
    
    def test_get_student_details(self, admin_token):
        """Test getting specific student details"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/student/{STUDENT_ID}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "student" in data
        assert data["student"]["student_id"] == STUDENT_ID
        # Verify enhanced data fields
        student = data["student"]
        assert "coaching_details" in student
        assert "funding_details" in student
        assert "exam_performance" in student
        print(f"Student details retrieved: {student['full_name']}")
        if student.get("coaching_details"):
            print(f"  Coaching: {student['coaching_details'].get('institute_name')}")
        if student.get("funding_details"):
            print(f"  Funding: {student['funding_details'].get('total_amount_allocated')}")


class TestAdminStudentManagement:
    """Test admin student management - coaching, funding, exams"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_update_coaching_details(self, admin_token):
        """Test updating coaching details for a student"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        coaching_data = {
            "institute_name": "Allen Career Institute",
            "institute_location": "Kota, Rajasthan",
            "coaching_type": "IIT-JEE",
            "course_duration": "2 Years",
            "batch_year": "2024-2026",
            "enrollment_date": "2024-04-01",
            "expected_exam_date": "JEE Advanced 2026"
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/student/coaching/{STUDENT_ID}",
            json=coaching_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("Coaching details updated successfully")
    
    def test_update_funding_details(self, admin_token):
        """Test updating funding details for a student"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        funding_data = {
            "total_amount_allocated": 250000,
            "amount_per_year": 125000,
            "amount_utilized": 50000,
            "payment_schedule": "Quarterly",
            "sponsored_items": ["Tuition Fee", "Books", "Test Series"],
            "funding_breakdown": {
                "tuition_fees": 150000,
                "study_material": 30000,
                "test_series": 20000,
                "hostel_food": 40000,
                "transport": 10000,
                "other": 0
            }
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/student/funding/{STUDENT_ID}",
            json=funding_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("Funding details updated successfully")
    
    def test_add_mock_test(self, admin_token):
        """Test adding mock test result for a student"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        mock_test_data = {
            "exam_name": f"TEST JEE Mock Test {uuid.uuid4().hex[:4]}",
            "test_date": "2025-01-15",
            "total_marks": 300,
            "obtained_marks": 185,
            "rank": 450,
            "percentile": 92.5,
            "subject_breakdown": {
                "physics": 65,
                "chemistry": 58,
                "mathematics": 62,
                "biology": None
            }
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/student/mock-test/{STUDENT_ID}",
            json=mock_test_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "test_id" in data
        print(f"Mock test added successfully: {data['test_id']}")
    
    def test_add_progress_report(self, admin_token):
        """Test adding progress report for a sponsored student"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        report_data = {
            "attendance_percentage": 92.5,
            "class_rank": 15,
            "total_in_class": 120,
            "report_text": "TEST: Student is showing excellent progress in all subjects.",
            "report_month": "2025-01",
            "funding_utilized_this_month": 12500,
            "subject_scores": {
                "physics": 85,
                "chemistry": 78,
                "mathematics": 82,
                "biology": None
            },
            "mock_test": None
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/progress-report/{STUDENT_ID}",
            json=report_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "report_id" in data
        print(f"Progress report added successfully: {data['report_id']}")


class TestCompanyDashboard:
    """Test company dashboard functionality"""
    
    @pytest.fixture
    def company_token(self):
        """Get company authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=COMPANY_CREDS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Company authentication failed")
    
    def test_get_available_students(self, company_token):
        """Test getting list of verified students available for sponsorship"""
        headers = {"Authorization": f"Bearer {company_token}"}
        response = requests.get(f"{BASE_URL}/api/company/students?page=1&limit=50", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "students" in data
        assert "pagination" in data
        print(f"Found {len(data['students'])} available students")
    
    def test_get_sponsored_students(self, company_token):
        """Test getting list of sponsored students with progress"""
        headers = {"Authorization": f"Bearer {company_token}"}
        response = requests.get(f"{BASE_URL}/api/company/sponsored-students", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "sponsored_students" in data
        # Verify structure includes progress reports
        if data["sponsored_students"]:
            sponsored = data["sponsored_students"][0]
            assert "student" in sponsored
            assert "sponsorship" in sponsored
            assert "progress_reports" in sponsored
            print(f"Found {len(data['sponsored_students'])} sponsored students")
            if sponsored.get("progress_reports"):
                print(f"  First student has {len(sponsored['progress_reports'])} progress reports")
    
    def test_get_company_profile(self, company_token):
        """Test getting company profile"""
        headers = {"Authorization": f"Bearer {company_token}"}
        response = requests.get(f"{BASE_URL}/api/company/profile", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "company" in data
        assert "company_name" in data["company"]
        print(f"Company profile: {data['company']['company_name']}")
    
    def test_filter_students_by_coaching_type(self, company_token):
        """Test filtering students by coaching type"""
        headers = {"Authorization": f"Bearer {company_token}"}
        response = requests.get(
            f"{BASE_URL}/api/company/students?page=1&limit=50&coaching_type=IIT-JEE",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "students" in data
        print(f"Found {len(data['students'])} IIT-JEE students")


class TestStudentDashboard:
    """Test student dashboard functionality"""
    
    @pytest.fixture
    def student_token(self):
        """Get student authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=STUDENT_CREDS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Student authentication failed")
    
    def test_get_student_profile(self, student_token):
        """Test getting student profile with enhanced data"""
        headers = {"Authorization": f"Bearer {student_token}"}
        response = requests.get(f"{BASE_URL}/api/student/profile", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "student" in data
        assert "documents" in data
        assert "sponsorship" in data
        assert "progress_reports" in data
        
        student = data["student"]
        # Verify enhanced fields
        assert "coaching_details" in student
        assert "funding_details" in student
        assert "exam_performance" in student
        
        print(f"Student profile: {student['full_name']}")
        print(f"  Verification: {student['verification_status']}")
        print(f"  Sponsored: {student['is_sponsored']}")
        if student.get("coaching_details"):
            print(f"  Coaching: {student['coaching_details'].get('coaching_type')}")
        if student.get("funding_details"):
            print(f"  Funding allocated: {student['funding_details'].get('total_amount_allocated')}")
        if data.get("progress_reports"):
            print(f"  Progress reports: {len(data['progress_reports'])}")


class TestVerificationFlow:
    """Test student verification flow"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_verify_student_approve(self, admin_token):
        """Test approving a student (using form data)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Note: This endpoint uses form data, not JSON
        response = requests.put(
            f"{BASE_URL}/api/admin/verify-student/{STUDENT_ID}",
            data={"approved": "true"},
            headers=headers
        )
        # May return 200 or 404 if already verified
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert data["success"] == True
            print("Student verification updated")


class TestDataIntegrity:
    """Test data integrity and persistence"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_coaching_data_persists(self, admin_token):
        """Test that coaching data persists after update"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Update coaching
        coaching_data = {
            "institute_name": "TEST Persistence Institute",
            "institute_location": "Test City",
            "coaching_type": "NEET",
            "course_duration": "1 Year",
            "batch_year": "2025",
            "enrollment_date": "2025-01-01",
            "expected_exam_date": "NEET 2025"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/student/coaching/{STUDENT_ID}",
            json=coaching_data,
            headers=headers
        )
        assert update_response.status_code == 200
        
        # Verify persistence
        get_response = requests.get(
            f"{BASE_URL}/api/admin/student/{STUDENT_ID}",
            headers=headers
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["student"]["coaching_details"]["institute_name"] == "TEST Persistence Institute"
        print("Coaching data persistence verified")
    
    def test_funding_data_persists(self, admin_token):
        """Test that funding data persists after update"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Update funding
        funding_data = {
            "total_amount_allocated": 300000,
            "amount_per_year": 150000,
            "amount_utilized": 75000,
            "payment_schedule": "Monthly",
            "sponsored_items": ["TEST Item 1", "TEST Item 2"],
            "funding_breakdown": {
                "tuition_fees": 200000,
                "study_material": 50000,
                "test_series": 25000,
                "hostel_food": 25000,
                "transport": 0,
                "other": 0
            }
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/student/funding/{STUDENT_ID}",
            json=funding_data,
            headers=headers
        )
        assert update_response.status_code == 200
        
        # Verify persistence
        get_response = requests.get(
            f"{BASE_URL}/api/admin/student/{STUDENT_ID}",
            headers=headers
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["student"]["funding_details"]["total_amount_allocated"] == 300000
        print("Funding data persistence verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
