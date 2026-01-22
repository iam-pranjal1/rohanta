import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'student';
  const [userType, setUserType] = useState(defaultType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors before continuing",
      });
      return;
    }

    setLoading(true);

    const result = await login(email, password, userType);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      if (userType === 'student') {
        navigate('/student/dashboard');
      } else if (userType === 'company') {
        navigate('/company/dashboard');
      } else if (userType === 'admin') {
        navigate('/admin/dashboard');
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.error || "Invalid credentials. Please check your email and password.",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <GraduationCap className="h-10 w-10 text-marigold" />
            <span className="font-heading text-3xl font-bold text-indigo-950">EduUplift</span>
          </Link>
        </div>

        <Card className="border-amber-100 shadow-lg" data-testid="login-card">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-indigo-950">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* User Type Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={() => setUserType('student')}
                className={`p-3 rounded-full border-2 transition-all ${
                  userType === 'student'
                    ? 'border-marigold bg-amber-50 text-marigold'
                    : 'border-gray-200 hover:border-marigold text-gray-600'
                }`}
                data-testid="login-type-student"
              >
                <GraduationCap className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-semibold">Student</div>
              </button>
              <button
                onClick={() => setUserType('company')}
                className={`p-3 rounded-full border-2 transition-all ${
                  userType === 'company'
                    ? 'border-marigold bg-amber-50 text-marigold'
                    : 'border-gray-200 hover:border-marigold text-gray-600'
                }`}
                data-testid="login-type-company"
              >
                <Building2 className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-semibold">Company</div>
              </button>
              <button
                onClick={() => setUserType('admin')}
                className={`p-3 rounded-full border-2 transition-all ${
                  userType === 'admin'
                    ? 'border-marigold bg-amber-50 text-marigold'
                    : 'border-gray-200 hover:border-marigold text-gray-600'
                }`}
                data-testid="login-type-admin"
              >
                <ShieldCheck className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-semibold">Admin</div>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  required
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  data-testid="login-email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  required
                  className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
                  data-testid="login-password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full py-3"
                data-testid="login-submit-button"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-sm text-marigold hover:underline">
                Forgot your password?
              </Link>
            </div>

            <div className="mt-2 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-marigold hover:underline font-semibold">
                Register here
              </Link>
            </div>

            {userType === 'admin' && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-gray-600">
                <p className="font-semibold text-indigo-950 mb-1">Admin Credentials:</p>
                <p>Email: admin@csredu.com</p>
                <p>Password: Admin@123</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;