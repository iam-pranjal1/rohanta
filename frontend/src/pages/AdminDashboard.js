import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, TrendingUp, LogOut, CheckCircle, XCircle, FileText, Award, Clock, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';
import Avatar from '../components/Avatar';
import AnimatedCard from '../components/AnimatedCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportData, setReportData] = useState({
    test_scores: {},
    attendance_percentage: '',
    report_text: '',
    report_month: ''
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-students')
      ]);
      
      setStats(statsRes.data);
      setPendingStudents(pendingRes.data.pending_students || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async (studentId, approved) => {
    try {
      const formData = new FormData();
      formData.append('approved', approved);
      
      await api.put(`/admin/verify-student/${studentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: approved ? "Student Approved" : "Student Rejected",
        description: approved ? "Student has been verified successfully" : "Student verification rejected",
      });
      
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update student status",
      });
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student",
      });
      return;
    }

    try {
      await api.post(`/admin/progress-report/${selectedStudent}`, {
        test_scores: reportData.test_scores,
        attendance_percentage: parseFloat(reportData.attendance_percentage),
        report_text: reportData.report_text,
        report_month: reportData.report_month
      });
      
      toast({
        title: "Report Added",
        description: "Progress report has been added successfully",
      });
      
      setReportData({
        test_scores: {},
        attendance_percentage: '',
        report_text: '',
        report_month: ''
      });
      setSelectedStudent(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add progress report",
      });
    }
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
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-marigold" />
              <span className="font-heading text-2xl font-bold">Admin Dashboard</span>
            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-indigo-900"
              data-testid="logout-btn"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <AnimatedCard delay={100} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-blue-600">
                {stats.total_students || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Registered</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                Verified Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-emerald-600">
                {stats.verified_students || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Approved</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                Pending Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-amber-600">
                {stats.pending_students || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting Review</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-rose-100 rounded-full">
                  <Heart className="h-4 w-4 text-rose-600" />
                </div>
                Sponsored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-rose-600">
                {stats.sponsored_students || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active</p>
            </CardContent>
          </AnimatedCard>
        </div>

        <Tabs defaultValue="verify" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="verify" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="verify-tab">
              <Users className="h-4 w-4 mr-2" />
              Verify Students
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="progress-tab">
              <TrendingUp className="h-4 w-4 mr-2" />
              Add Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verify">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Pending Student Verifications</CardTitle>
                <CardDescription>Review and verify student documents</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <p className="text-gray-600">No pending verifications</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingStudents.map(({ student, documents }) => (
                      <AnimatedCard key={student.student_id} className="border-gray-200 hover:shadow-lg hover-lift" data-testid={`pending-student-${student.student_id}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar name={student.full_name} size="lg" />
                              <div>
                                <CardTitle className="text-lg">{student.full_name}</CardTitle>
                                <CardDescription>{student.email} • {student.phone}</CardDescription>
                              </div>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800">
                              PENDING
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-3">Student Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">School:</span>
                                  <span className="font-medium">{student.school_name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">10th Score:</span>
                                  <span className="font-medium text-marigold">{student.class_10_percentage}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">DOB:</span>
                                  <span className="font-medium">{student.date_of_birth}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Address:</span>
                                  <span className="font-medium text-right max-w-xs">{student.address}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-700 mb-3">Uploaded Documents</h4>
                              <div className="space-y-2">
                                {documents.map((doc) => (
                                  <div key={doc.doc_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-sm">
                                    <div className="flex items-center">
                                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                      <div>
                                        <p className="text-sm font-medium">{doc.document_type.replace('_', ' ')}</p>
                                        <p className="text-xs text-gray-500">{doc.document_name}</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      Uploaded
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4 border-t">
                            <Button
                              onClick={() => handleVerifyStudent(student.student_id, true)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                              data-testid={`approve-btn-${student.student_id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleVerifyStudent(student.student_id, false)}
                              variant="destructive"
                              className="flex-1 font-semibold"
                              data-testid={`reject-btn-${student.student_id}`}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Add Progress Report</CardTitle>
                <CardDescription>Upload progress data for sponsored students</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddReport} className="space-y-6">
                  <div>
                    <Label htmlFor="student_id">Select Student</Label>
                    <Input
                      id="student_id"
                      placeholder="Enter Student ID"
                      value={selectedStudent || ''}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      required
                      className="mt-1"
                      data-testid="student-id-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the student ID from sponsored students list</p>
                  </div>

                  <div>
                    <Label htmlFor="report_month">Report Month</Label>
                    <Input
                      id="report_month"
                      type="month"
                      value={reportData.report_month}
                      onChange={(e) => setReportData({...reportData, report_month: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="report-month"
                    />
                  </div>

                  <div>
                    <Label htmlFor="attendance">Attendance Percentage</Label>
                    <Input
                      id="attendance"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="85.5"
                      value={reportData.attendance_percentage}
                      onChange={(e) => setReportData({...reportData, attendance_percentage: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="attendance-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="test_scores">Test Scores (JSON format)</Label>
                    <Textarea
                      id="test_scores"
                      placeholder='{"Physics": 85, "Chemistry": 90, "Mathematics": 95}'
                      value={JSON.stringify(reportData.test_scores)}
                      onChange={(e) => {
                        try {
                          setReportData({...reportData, test_scores: JSON.parse(e.target.value)});
                        } catch (err) {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="mt-1 font-mono text-sm"
                      rows={3}
                      data-testid="test-scores-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter test scores in JSON format</p>
                  </div>

                  <div>
                    <Label htmlFor="report_text">Report Comments</Label>
                    <Textarea
                      id="report_text"
                      placeholder="Student is showing excellent progress in all subjects..."
                      value={reportData.report_text}
                      onChange={(e) => setReportData({...reportData, report_text: e.target.value})}
                      className="mt-1"
                      rows={4}
                      data-testid="report-text"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-semibold"
                    data-testid="submit-report-btn"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Progress Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
