import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Upload, FileText, CheckCircle, Clock, XCircle, LogOut, 
  TrendingUp, Heart, Award, Target, DollarSign, BookOpen, Calendar,
  Building2, MapPin, Phone, Mail, Star, Eye, AlertCircle, PartyPopper
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';
import Avatar from '../components/Avatar';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedProgressTimeline from '../components/EnhancedProgressTimeline';
import InstituteSelection from '../components/InstituteSelection';
import NotificationBell from '../components/NotificationBell';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/student/profile');
      setProfile(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        
        await api.post('/student/upload-document', {
          document_type: documentType,
          document_data: base64Data,
          document_name: file.name
        });

        toast({
          title: "Document Uploaded",
          description: "Your document has been uploaded successfully",
        });
        
        fetchProfile();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: error.response?.data?.detail || "Failed to upload document",
        });
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marigold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const student = profile?.student;
  const documents = profile?.documents || [];
  const sponsorship = profile?.sponsorship;
  const companyName = profile?.company_name;
  const companyEmail = profile?.company_email;
  const progressReports = profile?.progress_reports || [];
  const coaching = student?.coaching_details;
  const funding = student?.funding_details;
  const examPerformance = student?.exam_performance;
  const availableInstitutes = profile?.available_institutes || [];
  const dashboardStatus = profile?.dashboard_status || 'pending_verification';
  const selectedInstitute = student?.selected_institute;

  const getDocumentStatus = (docType) => {
    const doc = documents.find(d => d.document_type === docType);
    if (!doc) return { uploaded: false, status: null };
    return { uploaded: true, status: doc.verification_status };
  };

  const incomeDoc = getDocumentStatus('income_certificate');
  const class10Doc = getDocumentStatus('class_10_certificate');
  const aadharDoc = getDocumentStatus('aadhar');

  const allDocsUploaded = incomeDoc.uploaded && class10Doc.uploaded && aadharDoc.uploaded;
  const uploadProgress = [incomeDoc.uploaded, class10Doc.uploaded, aadharDoc.uploaded].filter(Boolean).length * 33.33;

  // Funding calculations
  const fundingProgress = funding?.total_amount_allocated > 0 
    ? ((funding?.amount_utilized || 0) / funding.total_amount_allocated) * 100 
    : 0;

  // Mock test trends
  const mockTests = examPerformance?.mock_tests || [];
  const latestMockTest = mockTests.length > 0 ? mockTests[mockTests.length - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white" data-testid="student-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-marigold" />
              <span className="font-heading text-2xl font-bold text-indigo-950">EduUplift</span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Button 
                onClick={handleLogout}
                variant="ghost"
                className="text-gray-600 hover:text-indigo-950"
                data-testid="logout-btn"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section with Profile Summary */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-950 to-indigo-900 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar name={student?.full_name} size="xl" className="border-4 border-amber-400 animate-scale-in" />
              <div className="flex-1">
                <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
                  Welcome, {student?.full_name}!
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {student?.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {student?.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {student?.school_name}
                  </div>
                </div>
                {student?.is_sponsored && companyName && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge className="bg-emerald-500 text-white">
                      <Heart className="h-3 w-3 mr-1" /> Sponsored by {companyName}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-6 w-6 text-amber-400" />
                  <span className="text-3xl font-bold text-amber-400">{student?.class_10_percentage}%</span>
                </div>
                <p className="text-xs text-gray-400">Class 10 Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline Banner */}
        <AnimatedCard delay={50} className="mb-8 border-amber-100 shadow-md">
          <CardContent className="p-6">
            <h3 className="font-heading text-lg font-bold text-indigo-950 mb-4">Application Status</h3>
            <div className="flex items-center justify-between">
              {/* Step 1: Registered */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  true ? 'bg-emerald-500' : 'bg-gray-200'
                }`}>
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs mt-2 text-gray-600">Registered</p>
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                dashboardStatus !== 'pending_verification' ? 'bg-emerald-500' : 'bg-gray-200'
              }`}></div>
              
              {/* Step 2: Verified */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  dashboardStatus !== 'pending_verification' ? 'bg-emerald-500' : 
                  dashboardStatus === 'pending_verification' ? 'bg-amber-500 animate-pulse' : 'bg-gray-200'
                }`}>
                  {dashboardStatus === 'pending_verification' ? (
                    <Clock className="h-5 w-5 text-white" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-600">Verified</p>
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                student?.is_sponsored ? 'bg-emerald-500' : 'bg-gray-200'
              }`}></div>
              
              {/* Step 3: Sponsored */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  student?.is_sponsored ? 'bg-emerald-500' : 
                  dashboardStatus === 'awaiting_sponsorship' ? 'bg-amber-500 animate-pulse' : 'bg-gray-200'
                }`}>
                  {student?.is_sponsored ? (
                    <Heart className="h-5 w-5 text-white" />
                  ) : (
                    <Clock className="h-5 w-5 text-white" />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-600">Sponsored</p>
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                selectedInstitute ? 'bg-emerald-500' : 'bg-gray-200'
              }`}></div>
              
              {/* Step 4: Enrolled */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedInstitute ? 'bg-emerald-500' : 
                  dashboardStatus === 'pending_institute_selection' ? 'bg-amber-500 animate-pulse' : 'bg-gray-200'
                }`}>
                  {selectedInstitute ? (
                    <GraduationCap className="h-5 w-5 text-white" />
                  ) : (
                    <Building2 className="h-5 w-5 text-white" />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-600">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Institute Selection - Show when sponsored but no institute selected */}
        {dashboardStatus === 'pending_institute_selection' && availableInstitutes.length > 0 && (
          <AnimatedCard delay={100} className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <PartyPopper className="h-8 w-8 text-emerald-500" />
                <div>
                  <CardTitle className="font-heading text-2xl text-indigo-950">
                    Congratulations! You've Been Sponsored! 🎉
                  </CardTitle>
                  <CardDescription>
                    Sponsored by <span className="font-semibold text-emerald-600">{companyName}</span> 
                    {companyEmail && <span className="text-gray-500"> • {companyEmail}</span>}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <InstituteSelection 
                institutes={availableInstitutes} 
                onSelect={() => fetchProfile()}
                fundingAllocated={funding?.total_amount_allocated}
              />
            </CardContent>
          </AnimatedCard>
        )}

        {/* Status Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <AnimatedCard delay={100} className="border-amber-100 shadow-md hover:shadow-xl hover-lift" data-testid="verification-status-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`text-sm px-3 py-1 font-semibold ${
                student?.verification_status === 'verified' ? 'bg-emerald-500 text-white' :
                student?.verification_status === 'rejected' ? 'bg-red-500 text-white' :
                'bg-amber-400 text-indigo-950'
              }`}>
                {student?.verification_status?.toUpperCase()}
              </Badge>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="border-amber-100 shadow-md hover:shadow-xl hover-lift" data-testid="sponsorship-status-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Heart className="h-4 w-4 text-purple-600" />
                </div>
                Sponsorship
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`text-sm px-3 py-1 font-semibold ${
                student?.is_sponsored ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {student?.is_sponsored ? 'SPONSORED' : 'AWAITING'}
              </Badge>
            </CardContent>
          </AnimatedCard>

          {coaching && (
            <AnimatedCard delay={300} className="border-amber-100 shadow-md hover:shadow-xl hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <Target className="h-4 w-4 text-indigo-600" />
                  </div>
                  Coaching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1">
                  {coaching.coaching_type}
                </Badge>
              </CardContent>
            </AnimatedCard>
          )}

          {latestMockTest && (
            <AnimatedCard delay={400} className="border-amber-100 shadow-md hover:shadow-xl hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  Latest Mock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-lg text-purple-700">
                  {latestMockTest.obtained_marks}/{latestMockTest.total_marks}
                </div>
                <p className="text-xs text-gray-500">Rank: {latestMockTest.rank || 'N/A'}</p>
              </CardContent>
            </AnimatedCard>
          )}
        </div>

        {/* Coaching Details Section */}
        {coaching && (
          <AnimatedCard delay={300} className="mb-8 border-amber-100 shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-indigo-950 flex items-center gap-2">
                <Target className="h-6 w-6 text-indigo-600" />
                Coaching Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-indigo-950">Institute</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{coaching.institute_name}</p>
                  <p className="text-sm text-gray-600">{coaching.institute_location}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-indigo-950">Program</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 mb-1">{coaching.coaching_type}</Badge>
                  <p className="text-sm text-gray-600">{coaching.course_duration}</p>
                  <p className="text-xs text-gray-500">Batch: {coaching.batch_year}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-indigo-950">Target Exam</span>
                  </div>
                  <p className="text-lg font-bold text-amber-700">{coaching.expected_exam_date}</p>
                  <p className="text-xs text-gray-500">Enrolled: {coaching.enrollment_date}</p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        )}

        {/* Funding Details Section */}
        {funding && funding.total_amount_allocated > 0 && (
          <AnimatedCard delay={350} className="mb-8 border-amber-100 shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-indigo-950 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-emerald-600" />
                Funding Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Total Allocated: {formatCurrency(funding.total_amount_allocated)}</span>
                  <span className="font-medium text-emerald-600">
                    Utilized: {formatCurrency(funding.amount_utilized)} ({fundingProgress.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={fundingProgress} className="h-4" />
                <p className="text-sm text-gray-500 mt-2">
                  Remaining: {formatCurrency(funding.total_amount_allocated - funding.amount_utilized)} | 
                  Payment Schedule: {funding.payment_schedule}
                </p>
              </div>

              {funding.funding_breakdown && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {Object.entries(funding.funding_breakdown).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 capitalize mb-1">{key.replace('_', ' ')}</p>
                        <p className="font-bold text-emerald-700">{formatCurrency(value)}</p>
                      </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        )}

        {/* Document Upload Section */}
        <AnimatedCard delay={400} className="mb-8 border-amber-100 shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-indigo-950">Document Upload</CardTitle>
            <CardDescription>Upload your documents for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-indigo-950">Upload Progress</span>
                <span className="text-base font-bold text-marigold">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-3" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Income Certificate */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-marigold hover:bg-amber-50/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-10 w-10 text-marigold" />
                  <div>
                    <h3 className="font-semibold text-indigo-950">Income Certificate</h3>
                    <p className="text-xs text-gray-500">PDF/JPG, Max 5MB</p>
                  </div>
                </div>
                {incomeDoc.uploaded ? (
                  <div>
                    <Badge className={`mb-3 px-3 py-1 ${
                      incomeDoc.status === 'verified' ? 'bg-emerald-500 text-white' :
                      incomeDoc.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-amber-400 text-indigo-950'
                    }`}>
                      {incomeDoc.status}
                    </Badge>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('income_certificate', e.target.files[0])}
                      disabled={uploading}
                      className="mt-2"
                      data-testid="upload-income-cert"
                    />
                  </div>
                )}
              </div>

              {/* 10th Certificate */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-marigold hover:bg-amber-50/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-10 w-10 text-marigold" />
                  <div>
                    <h3 className="font-semibold text-indigo-950">10th Class Certificate</h3>
                    <p className="text-xs text-gray-500">PDF/JPG, Max 5MB</p>
                  </div>
                </div>
                {class10Doc.uploaded ? (
                  <div>
                    <Badge className={`mb-3 px-3 py-1 ${
                      class10Doc.status === 'verified' ? 'bg-emerald-500 text-white' :
                      class10Doc.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-amber-400 text-indigo-950'
                    }`}>
                      {class10Doc.status}
                    </Badge>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('class_10_certificate', e.target.files[0])}
                      disabled={uploading}
                      className="mt-2"
                      data-testid="upload-class10-cert"
                    />
                  </div>
                )}
              </div>

              {/* Aadhar Card */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-marigold hover:bg-amber-50/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-10 w-10 text-marigold" />
                  <div>
                    <h3 className="font-semibold text-indigo-950">Aadhar Card</h3>
                    <p className="text-xs text-gray-500">PDF/JPG, Max 5MB</p>
                  </div>
                </div>
                {aadharDoc.uploaded ? (
                  <div>
                    <Badge className={`mb-3 px-3 py-1 ${
                      aadharDoc.status === 'verified' ? 'bg-emerald-500 text-white' :
                      aadharDoc.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-amber-400 text-indigo-950'
                    }`}>
                      {aadharDoc.status}
                    </Badge>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('aadhar', e.target.files[0])}
                      disabled={uploading}
                      className="mt-2"
                      data-testid="upload-aadhar"
                    />
                  </div>
                )}
              </div>
            </div>

            {allDocsUploaded && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-800 font-semibold">
                  <CheckCircle className="inline h-5 w-5 mr-2" />
                  All documents uploaded! Awaiting admin verification.
                </p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Exam Performance Section */}
        {examPerformance && (mockTests.length > 0 || examPerformance.actual_exams?.length > 0) && (
          <AnimatedCard delay={450} className="mb-8 border-amber-100 shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-indigo-950 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                Exam Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mock Tests Summary */}
              {mockTests.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Mock Test Trend (Last 5)</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {mockTests.slice(-5).map((test, idx) => (
                      <div key={test.test_id || idx} className="flex-shrink-0 bg-purple-50 rounded-lg p-3 min-w-[120px]">
                        <p className="text-xs text-gray-600 truncate">{test.exam_name}</p>
                        <p className="font-bold text-purple-700">{test.obtained_marks}/{test.total_marks}</p>
                        <p className="text-xs text-gray-500">Rank: {test.rank || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actual Exams */}
              {examPerformance.actual_exams?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Actual Exam Results</h4>
                  <div className="space-y-2">
                    {examPerformance.actual_exams.map((exam, idx) => (
                      <div key={exam.exam_id || idx} className="bg-amber-50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{exam.exam_name}</p>
                          <p className="text-sm text-gray-600">
                            Score: {exam.obtained_marks}/{exam.total_marks} | AIR: {exam.rank || 'N/A'}
                          </p>
                        </div>
                        <Badge className={exam.qualified ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}>
                          {exam.qualified ? 'QUALIFIED' : 'NOT QUALIFIED'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Result */}
              {examPerformance.final_result?.exam_cleared && (
                <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-6 text-white">
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    ACHIEVEMENT UNLOCKED!
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-emerald-100">Exam Cleared</p>
                      <p className="font-bold text-lg">{examPerformance.final_result.exam_name}</p>
                    </div>
                    <div>
                      <p className="text-emerald-100">All India Rank</p>
                      <p className="font-bold text-lg">{examPerformance.final_result.final_rank}</p>
                    </div>
                    <div>
                      <p className="text-emerald-100">College Allotted</p>
                      <p className="font-bold">{examPerformance.final_result.college_allotted}</p>
                    </div>
                    <div>
                      <p className="text-emerald-100">Branch/Course</p>
                      <p className="font-bold">{examPerformance.final_result.branch_course}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        )}

        {/* Progress Timeline */}
        {sponsorship && (
          <AnimatedCard delay={500} className="border-amber-100 shadow-md" data-testid="progress-reports-section">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-indigo-950 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-indigo-600" />
                Progress Timeline
              </CardTitle>
              <CardDescription>Your monthly progress reports</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedProgressTimeline reports={progressReports} student={student} />
            </CardContent>
          </AnimatedCard>
        )}

        {/* Empty State for No Sponsor */}
        {!sponsorship && student?.verification_status === 'verified' && (
          <AnimatedCard delay={500} className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 text-marigold mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-indigo-950 mb-2">Awaiting Sponsorship</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your profile is verified and visible to companies. You'll be notified when a company sponsors your education.
              </p>
            </CardContent>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
