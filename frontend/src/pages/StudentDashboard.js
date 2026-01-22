import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Upload, FileText, CheckCircle, Clock, XCircle, LogOut, TrendingUp, Heart, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

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
  const progressReports = profile?.progress_reports || [];

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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-indigo-950 mb-2">
            Welcome, {student?.full_name}!
          </h1>
          <p className="text-gray-600 text-lg">Track your journey towards IIT/NEET success</p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-100 shadow-md hover:shadow-lg transition-all" data-testid="verification-status-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={`text-sm px-4 py-2 font-semibold ${
                  student?.verification_status === 'verified' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                  student?.verification_status === 'rejected' ? 'bg-red-500 text-white hover:bg-red-600' :
                  'bg-amber-400 text-indigo-950 hover:bg-amber-500'
                }`}>
                  {student?.verification_status === 'verified' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {student?.verification_status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                  {student?.verification_status === 'rejected' && <XCircle className="h-4 w-4 mr-1" />}
                  {student?.verification_status?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {student?.verification_status === 'verified' && 'Your documents have been verified'}
                {student?.verification_status === 'pending' && 'Admin reviewing your documents'}
                {student?.verification_status === 'rejected' && 'Please reupload your documents'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-md hover:shadow-lg transition-all" data-testid="sponsorship-status-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                Sponsorship Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {student?.is_sponsored ? (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 text-sm px-4 py-2 font-semibold">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    SPONSORED
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm px-4 py-2 font-semibold">
                    <Clock className="h-4 w-4 mr-1" />
                    AWAITING SPONSOR
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {student?.is_sponsored ? 'A company is supporting your education' : 'Your profile is visible to companies'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-marigold-100 rounded-full">
                  <Award className="h-5 w-5 text-marigold-600" />
                </div>
                Class 10 Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-heading font-bold text-marigold">
                  {student?.class_10_percentage}%
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-marigold to-amber-400" 
                      style={{width: `${student?.class_10_percentage}%`}}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Academic Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Upload Section */}
        <Card className="mb-8 border-amber-100">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-indigo-950">Document Upload</CardTitle>
            <CardDescription>Upload your documents for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-indigo-950">Upload Progress</span>
                <span className="text-base font-bold text-marigold">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="relative">
                <Progress value={uploadProgress} className="h-3" />
                <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-between px-1">
                  <div className={`w-1 h-full ${uploadProgress >= 33 ? 'bg-white' : 'bg-transparent'}`} />
                  <div className={`w-1 h-full ${uploadProgress >= 66 ? 'bg-white' : 'bg-transparent'}`} />
                  <div className={`w-1 h-full ${uploadProgress >= 99 ? 'bg-white' : 'bg-transparent'}`} />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0 docs</span>
                <span>1 doc</span>
                <span>2 docs</span>
                <span>3 docs</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Income Certificate */}
              <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 hover:border-marigold transition-all">
                <FileText className="h-12 w-12 text-marigold mb-4" />
                <h3 className="font-semibold text-indigo-950 mb-2">Income Certificate</h3>
                {incomeDoc.uploaded ? (
                  <div>
                    <Badge className={`mb-3 ${
                      incomeDoc.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                      incomeDoc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {incomeDoc.status}
                    </Badge>
                    <p className="text-sm text-gray-600">Uploaded successfully</p>
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
              <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 hover:border-marigold transition-all">
                <FileText className="h-12 w-12 text-marigold mb-4" />
                <h3 className="font-semibold text-indigo-950 mb-2">10th Class Certificate</h3>
                {class10Doc.uploaded ? (
                  <div>
                    <Badge className={`mb-3 ${
                      class10Doc.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                      class10Doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {class10Doc.status}
                    </Badge>
                    <p className="text-sm text-gray-600">Uploaded successfully</p>
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
              <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 hover:border-marigold transition-all">
                <FileText className="h-12 w-12 text-marigold mb-4" />
                <h3 className="font-semibold text-indigo-950 mb-2">Aadhar Card</h3>
                {aadharDoc.uploaded ? (
                  <div>
                    <Badge className={`mb-3 ${
                      aadharDoc.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                      aadharDoc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {aadharDoc.status}
                    </Badge>
                    <p className="text-sm text-gray-600">Uploaded successfully</p>
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
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-sm">
                <p className="text-emerald-800 font-semibold">
                  <CheckCircle className="inline h-5 w-5 mr-2" />
                  All documents uploaded! Awaiting admin verification.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Reports */}
        {sponsorship && progressReports.length > 0 && (
          <Card className="border-amber-100" data-testid="progress-reports-section">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-indigo-950">Your Progress</CardTitle>
              <CardDescription>Track your academic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressReports.map((report) => (
                  <div key={report.report_id} className="border border-amber-100 rounded-sm p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-indigo-950">{report.report_month}</h3>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Progress Update
                      </Badge>
                    </div>
                    
                    {report.test_scores && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Test Scores:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(report.test_scores).map(([subject, score]) => (
                            <div key={subject} className="bg-amber-50 p-2 rounded-sm">
                              <span className="text-xs text-gray-600">{subject}:</span>
                              <span className="ml-2 font-semibold text-indigo-950">{score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {report.attendance_percentage && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Attendance:</p>
                        <div className="flex items-center">
                          <Progress value={report.attendance_percentage} className="h-2 flex-1 mr-3" />
                          <span className="font-semibold text-indigo-950">{report.attendance_percentage}%</span>
                        </div>
                      </div>
                    )}
                    
                    {report.report_text && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Comments:</p>
                        <p className="text-gray-700">{report.report_text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for No Sponsor */}
        {!sponsorship && student?.verification_status === 'verified' && (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 text-marigold mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-indigo-950 mb-2">Awaiting Sponsorship</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your profile is verified and visible to companies. You'll be notified when a company sponsors your education.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
