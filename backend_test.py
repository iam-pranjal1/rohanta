import requests
import sys
import json
from datetime import datetime
import base64

class CSREducationAPITester:
    def __init__(self, base_url="https://student-sponsor-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.student_token = None
        self.company_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.student_id = None
        self.company_id = None
        self.sponsorship_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # For multipart/form-data
                    headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                if files:
                    headers.pop('Content-Type', None)
                    response = requests.put(url, data=data, files=files, headers=headers)
                else:
                    response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response text: {response.text}")

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_public_stats(self):
        """Test public stats endpoint"""
        success, response = self.run_test(
            "Public Stats",
            "GET",
            "public/stats",
            200
        )
        return success

    def test_student_registration(self):
        """Test student registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        student_data = {
            "email": f"student_{timestamp}@test.com",
            "password": "TestPass123!",
            "full_name": f"Test Student {timestamp}",
            "date_of_birth": "2005-01-15",
            "phone": "9876543210",
            "school_name": "Government High School",
            "class_10_percentage": 85.5,
            "address": "123 Test Street, Test City"
        }
        
        success, response = self.run_test(
            "Student Registration",
            "POST",
            "auth/student/register",
            200,
            data=student_data
        )
        
        if success and 'token' in response:
            self.student_token = response['token']
            self.student_id = response['user']['student_id']
            print(f"Student ID: {self.student_id}")
            return True
        return False

    def test_company_registration(self):
        """Test company registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        company_data = {
            "email": f"company_{timestamp}@test.com",
            "password": "TestPass123!",
            "company_name": f"Test Company {timestamp}",
            "contact_person": "John Doe",
            "phone": "9876543211",
            "industry": "Technology",
            "website": "https://testcompany.com"
        }
        
        success, response = self.run_test(
            "Company Registration",
            "POST",
            "auth/company/register",
            200,
            data=company_data
        )
        
        if success and 'token' in response:
            self.company_token = response['token']
            self.company_id = response['user']['company_id']
            print(f"Company ID: {self.company_id}")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@csredu.com",
            "password": "Admin@123",
            "role": "admin"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_student_login(self):
        """Test student login with registered credentials"""
        if not self.student_id:
            return False
            
        login_data = {
            "email": f"student_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "role": "student"
        }
        
        success, response = self.run_test(
            "Student Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_document_upload(self):
        """Test document upload"""
        if not self.student_token:
            return False
            
        # Create a dummy base64 document
        dummy_content = "This is a test document content"
        base64_content = base64.b64encode(dummy_content.encode()).decode()
        
        document_data = {
            "document_type": "income_certificate",
            "document_data": base64_content,
            "document_name": "test_income_cert.pdf"
        }
        
        success, response = self.run_test(
            "Document Upload",
            "POST",
            "student/upload-document",
            200,
            data=document_data,
            token=self.student_token
        )
        return success

    def test_student_profile(self):
        """Test student profile retrieval"""
        if not self.student_token:
            return False
            
        success, response = self.run_test(
            "Student Profile",
            "GET",
            "student/profile",
            200,
            token=self.student_token
        )
        return success

    def test_admin_pending_students(self):
        """Test admin pending students"""
        if not self.admin_token:
            return False
            
        success, response = self.run_test(
            "Admin Pending Students",
            "GET",
            "admin/pending-students",
            200,
            token=self.admin_token
        )
        return success

    def test_admin_verify_student(self):
        """Test admin student verification"""
        if not self.admin_token or not self.student_id:
            return False
            
        success, response = self.run_test(
            "Admin Verify Student",
            "PUT",
            f"admin/verify-student/{self.student_id}",
            200,
            data={'approved': 'true'},
            token=self.admin_token,
            files={}
        )
        return success

    def test_company_students_list(self):
        """Test company students list"""
        if not self.company_token:
            return False
            
        success, response = self.run_test(
            "Company Students List",
            "GET",
            "company/students",
            200,
            token=self.company_token
        )
        return success

    def test_company_sponsor_student(self):
        """Test company sponsor student"""
        if not self.company_token or not self.student_id:
            return False
            
        success, response = self.run_test(
            "Company Sponsor Student",
            "POST",
            f"company/sponsor/{self.student_id}",
            200,
            token=self.company_token
        )
        
        if success and 'sponsorship_id' in response:
            self.sponsorship_id = response['sponsorship_id']
            return True
        return success

    def test_company_sponsored_students(self):
        """Test company sponsored students"""
        if not self.company_token:
            return False
            
        success, response = self.run_test(
            "Company Sponsored Students",
            "GET",
            "company/sponsored-students",
            200,
            token=self.company_token
        )
        return success

    def test_admin_progress_report(self):
        """Test admin add progress report"""
        if not self.admin_token or not self.student_id:
            return False
            
        report_data = {
            "test_scores": {"Physics": 85, "Chemistry": 90, "Mathematics": 95},
            "attendance_percentage": 92.5,
            "report_text": "Student is showing excellent progress in all subjects",
            "report_month": "2025-01"
        }
        
        success, response = self.run_test(
            "Admin Progress Report",
            "POST",
            f"admin/progress-report/{self.student_id}",
            200,
            data=report_data,
            token=self.admin_token
        )
        return success

    def test_admin_stats(self):
        """Test admin stats"""
        if not self.admin_token:
            return False
            
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            token=self.admin_token
        )
        return success

def main():
    print("🚀 Starting CSR Education Platform API Tests")
    print("=" * 50)
    
    tester = CSREducationAPITester()
    
    # Test sequence
    tests = [
        ("Public Stats", tester.test_public_stats),
        ("Student Registration", tester.test_student_registration),
        ("Company Registration", tester.test_company_registration),
        ("Admin Login", tester.test_admin_login),
        ("Document Upload", tester.test_document_upload),
        ("Student Profile", tester.test_student_profile),
        ("Admin Pending Students", tester.test_admin_pending_students),
        ("Admin Verify Student", tester.test_admin_verify_student),
        ("Company Students List", tester.test_company_students_list),
        ("Company Sponsor Student", tester.test_company_sponsor_student),
        ("Company Sponsored Students", tester.test_company_sponsored_students),
        ("Admin Progress Report", tester.test_admin_progress_report),
        ("Admin Stats", tester.test_admin_stats)
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"  - {test}")
    else:
        print("\n🎉 All tests passed!")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())