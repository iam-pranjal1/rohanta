import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const ForgotPassword = () => {
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
        role: userType
      });

      setSuccess(true);
      toast({
        title: "Email Sent",
        description: "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.detail || "Failed to send reset email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <GraduationCap className="h-10 w-10 text-marigold" />
              <span className="font-heading text-3xl font-bold text-indigo-950">EduUplift</span>
            </Link>
          </div>

          <Card className="border-amber-100 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-indigo-950 text-center">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please check your inbox and click the link to reset your password. The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full">
                    Back to Login
                  </Button>
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm text-gray-600 hover:text-marigold"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <GraduationCap className="h-10 w-10 text-marigold" />
            <span className="font-heading text-3xl font-bold text-indigo-950">EduUplift</span>
          </Link>
        </div>

        <Card className="border-amber-100 shadow-lg" data-testid="forgot-password-card">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-indigo-950">Forgot Password?</CardTitle>
            <CardDescription>Enter your email to receive a password reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={() => setUserType('student')}
                className={`p-3 rounded-full border-2 transition-all ${
                  userType === 'student'
                    ? 'border-marigold bg-amber-50 text-marigold'
                    : 'border-gray-200 hover:border-marigold text-gray-600'
                }`}
                data-testid="forgot-type-student"
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
                data-testid="forgot-type-company"
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
                data-testid="forgot-type-admin"
              >
                <ShieldCheck className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-semibold">Admin</div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
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
                  data-testid="forgot-email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full py-3"
                data-testid="forgot-submit-btn"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-marigold">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
