import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'student';
  const [userType, setUserType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerStudent, registerCompany } = useAuth();
  const { toast } = useToast();

  // Student form data
  const [studentData, setStudentData] = useState({
    email: '',
    password: '',
    full_name: '',
    date_of_birth: '',
    phone: '',
    school_name: '',
    class_10_percentage: '',
    address: ''
  });

  // Company form data
  const [companyData, setCompanyData] = useState({
    email: '',
    password: '',
    company_name: '',
    contact_person: '',
    phone: '',
    industry: '',
    website: ''
  });

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleCompanyChange = (e) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (userType === 'student') {
      result = await registerStudent({
        ...studentData,
        class_10_percentage: parseFloat(studentData.class_10_percentage)
      });
    } else {
      result = await registerCompany(companyData);
    }

    if (result.success) {
      toast({
        title: "Registration Successful",
        description: "Welcome to EduUplift!",
      });
      
      if (userType === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/company/dashboard');
      }
    } else {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: result.error,
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <GraduationCap className="h-10 w-10 text-marigold" />
            <span className="font-heading text-3xl font-bold text-indigo-950">EduUplift</span>
          </Link>
        </div>

        <Card className="border-amber-100 shadow-lg" data-testid="register-card">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-indigo-950">Create Your Account</CardTitle>
            <CardDescription>Join the EduUplift community today</CardDescription>
          </CardHeader>
          <CardContent>
            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setUserType('student')}
                className={`p-4 rounded-sm border-2 transition-all ${
                  userType === 'student'
                    ? 'border-marigold bg-amber-50'
                    : 'border-gray-200 hover:border-marigold'
                }`}
                data-testid="register-type-student"
              >
                <GraduationCap className={`h-8 w-8 mx-auto mb-2 ${
                  userType === 'student' ? 'text-marigold' : 'text-gray-600'
                }`} />
                <div className="font-semibold text-indigo-950">I'm a Student</div>
              </button>
              <button
                onClick={() => setUserType('company')}
                className={`p-4 rounded-sm border-2 transition-all ${
                  userType === 'company'
                    ? 'border-marigold bg-amber-50'
                    : 'border-gray-200 hover:border-marigold'
                }`}
                data-testid="register-type-company"
              >
                <Building2 className={`h-8 w-8 mx-auto mb-2 ${
                  userType === 'company' ? 'text-marigold' : 'text-gray-600'
                }`} />
                <div className="font-semibold text-indigo-950">I'm a Company</div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {userType === 'student' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={studentData.full_name}
                        onChange={handleStudentChange}
                        required
                        className="mt-1"
                        data-testid="student-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={studentData.date_of_birth}
                        onChange={handleStudentChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={studentData.email}
                        onChange={handleStudentChange}
                        required
                        className="mt-1"
                        data-testid="student-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={studentData.phone}
                        onChange={handleStudentChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={studentData.password}
                      onChange={handleStudentChange}
                      required
                      className="mt-1"
                      data-testid="student-password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                      id="school_name"
                      name="school_name"
                      value={studentData.school_name}
                      onChange={handleStudentChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="class_10_percentage">10th Class Percentage</Label>
                      <Input
                        id="class_10_percentage"
                        name="class_10_percentage"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={studentData.class_10_percentage}
                        onChange={handleStudentChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={studentData.address}
                      onChange={handleStudentChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={companyData.company_name}
                      onChange={handleCompanyChange}
                      required
                      className="mt-1"
                      data-testid="company-name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        name="contact_person"
                        value={companyData.contact_person}
                        onChange={handleCompanyChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={companyData.phone}
                        onChange={handleCompanyChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={companyData.email}
                        onChange={handleCompanyChange}
                        required
                        className="mt-1"
                        data-testid="company-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={companyData.password}
                        onChange={handleCompanyChange}
                        required
                        className="mt-1"
                        data-testid="company-password"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={companyData.industry}
                        onChange={handleCompanyChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={companyData.website}
                        onChange={handleCompanyChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full py-3 mt-6"
                data-testid="register-submit-btn"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-marigold hover:underline font-semibold">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;