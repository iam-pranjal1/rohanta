import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, Building2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

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
    confirm_password: '',
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
    confirm_password: '',
    company_name: '',
    contact_person: '',
    phone: '',
    industry: '',
    website: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStudentForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!studentData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(studentData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!studentData.full_name || studentData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    // Date of birth validation
    if (!studentData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(studentData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 10 || age > 25) {
        newErrors.date_of_birth = 'Age must be between 10 and 25 years';
      }
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!studentData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(studentData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (!studentData.password) {
      newErrors.password = 'Password is required';
    } else if (studentData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(studentData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!studentData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (studentData.password !== studentData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // School name validation
    if (!studentData.school_name || studentData.school_name.trim().length < 3) {
      newErrors.school_name = 'School name must be at least 3 characters';
    }

    // Percentage validation
    if (!studentData.class_10_percentage) {
      newErrors.class_10_percentage = 'Class 10 percentage is required';
    } else if (studentData.class_10_percentage < 0 || studentData.class_10_percentage > 100) {
      newErrors.class_10_percentage = 'Percentage must be between 0 and 100';
    }

    // Address validation
    if (!studentData.address || studentData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCompanyForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!companyData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(companyData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Company name validation
    if (!companyData.company_name || companyData.company_name.trim().length < 2) {
      newErrors.company_name = 'Company name must be at least 2 characters';
    }

    // Contact person validation
    if (!companyData.contact_person || companyData.contact_person.trim().length < 2) {
      newErrors.contact_person = 'Contact person name must be at least 2 characters';
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!companyData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(companyData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (!companyData.password) {
      newErrors.password = 'Password is required';
    } else if (companyData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(companyData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!companyData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (companyData.password !== companyData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Industry validation
    if (!companyData.industry || companyData.industry.trim().length < 2) {
      newErrors.industry = 'Industry is required';
    }

    // Website validation (optional, but validate if provided)
    if (companyData.website && companyData.website.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(companyData.website)) {
        newErrors.website = 'Please enter a valid website URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = userType === 'student' ? validateStudentForm() : validateCompanyForm();
    
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting",
      });
      return;
    }

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
        description: result.error || "Unable to create account. Please try again.",
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
                        className={`mt-1 ${errors.full_name ? 'border-red-500' : ''}`}
                        data-testid="student-name"
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                      )}
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
                        className={`mt-1 ${errors.date_of_birth ? 'border-red-500' : ''}`}
                      />
                      {errors.date_of_birth && (
                        <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>
                      )}
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
                        className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                        data-testid="student-email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={studentData.phone}
                        onChange={handleStudentChange}
                        placeholder="9876543210"
                        required
                        className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={studentData.password}
                        onChange={handleStudentChange}
                        required
                        className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
                        data-testid="student-password"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        value={studentData.confirm_password}
                        onChange={handleStudentChange}
                        required
                        className={`mt-1 ${errors.confirm_password ? 'border-red-500' : ''}`}
                        data-testid="student-confirm-password"
                      />
                      {errors.confirm_password && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                      id="school_name"
                      name="school_name"
                      value={studentData.school_name}
                      onChange={handleStudentChange}
                      required
                      className={`mt-1 ${errors.school_name ? 'border-red-500' : ''}`}
                    />
                    {errors.school_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.school_name}</p>
                    )}
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
                        placeholder="85.5"
                        required
                        className={`mt-1 ${errors.class_10_percentage ? 'border-red-500' : ''}`}
                      />
                      {errors.class_10_percentage && (
                        <p className="text-red-500 text-xs mt-1">{errors.class_10_percentage}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={studentData.address}
                      onChange={handleStudentChange}
                      placeholder="Full address with village/city and district"
                      required
                      className={`mt-1 ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
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
                      className={`mt-1 ${errors.company_name ? 'border-red-500' : ''}`}
                      data-testid="company-name"
                    />
                    {errors.company_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
                    )}
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
                        className={`mt-1 ${errors.contact_person ? 'border-red-500' : ''}`}
                      />
                      {errors.contact_person && (
                        <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={companyData.phone}
                        onChange={handleCompanyChange}
                        placeholder="9876543210"
                        required
                        className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
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
                        className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                        data-testid="company-email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={companyData.industry}
                        onChange={handleCompanyChange}
                        required
                        className={`mt-1 ${errors.industry ? 'border-red-500' : ''}`}
                      />
                      {errors.industry && (
                        <p className="text-red-500 text-xs mt-1">{errors.industry}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={companyData.password}
                        onChange={handleCompanyChange}
                        required
                        className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
                        data-testid="company-password"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        value={companyData.confirm_password}
                        onChange={handleCompanyChange}
                        required
                        className={`mt-1 ${errors.confirm_password ? 'border-red-500' : ''}`}
                        data-testid="company-confirm-password"
                      />
                      {errors.confirm_password && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={companyData.website}
                      onChange={handleCompanyChange}
                      className={`mt-1 ${errors.website ? 'border-red-500' : ''}`}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                    )}
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