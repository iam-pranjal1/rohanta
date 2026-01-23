import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Users, TrendingUp, LogOut, CheckCircle, XCircle, FileText, 
  Award, Clock, Heart, Settings, Upload, Search, Filter, ChevronDown,
  Target, BookOpen, Calendar, Building2, Trophy, Briefcase, Shield
} from 'lucide-react';
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
import AdminStudentForms from '../components/AdminStudentForms';
import StudentProfileCard from '../components/StudentProfileCard';
import CSRPartners from '../components/CSRPartners';
import UserCredentials from '../components/UserCredentials';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingStudents, setPendingStudents] = useState([]);
  const [sponsoredStudents, setSponsoredStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Progress Report Form State
  const [reportForm, setReportForm] = useState({
    attendance_percentage: '',
    class_rank: '',
    total_in_class: '',
    report_text: '',
    report_month: '',
    funding_utilized_this_month: '',
    subject_scores: {
      physics: '',
      chemistry: '',
      mathematics: '',
      biology: ''
    },
    mock_test: null
  });
  const [includeMockTest, setIncludeMockTest] = useState(false);
  const [mockTestForm, setMockTestForm] = useState({
    exam_name: '',
    test_date: '',
    total_marks: 300,
    obtained_marks: 0,
    rank: '',
    percentile: '',
    subject_breakdown: { physics: '', chemistry: '', mathematics: '', biology: '' }
  });

  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const [statsRes, pendingRes, sponsoredRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/pending-students?${params.toString()}`),
        api.get('/admin/sponsored-students')
      ]);
      
      setStats(statsRes.data);
      setPendingStudents(pendingRes.data.pending_students || []);
      setSponsoredStudents(sponsoredRes.data.sponsored_students || []);
      
      // Combine all students for the manage tab
      const allStudentsList = [...(pendingRes.data.pending_students || []).map(s => s.student)];
      setAllStudents(allStudentsList);
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

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await api.get(`/admin/student/${studentId}`);
      setSelectedStudentDetails(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student details",
      });
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
      const reportData = {
        attendance_percentage: reportForm.attendance_percentage ? parseFloat(reportForm.attendance_percentage) : null,
        class_rank: reportForm.class_rank ? parseInt(reportForm.class_rank) : null,
        total_in_class: reportForm.total_in_class ? parseInt(reportForm.total_in_class) : null,
        report_text: reportForm.report_text || null,
        report_month: reportForm.report_month,
        funding_utilized_this_month: reportForm.funding_utilized_this_month ? parseFloat(reportForm.funding_utilized_this_month) : null,
        subject_scores: {
          physics: reportForm.subject_scores.physics ? parseFloat(reportForm.subject_scores.physics) : null,
          chemistry: reportForm.subject_scores.chemistry ? parseFloat(reportForm.subject_scores.chemistry) : null,
          mathematics: reportForm.subject_scores.mathematics ? parseFloat(reportForm.subject_scores.mathematics) : null,
          biology: reportForm.subject_scores.biology ? parseFloat(reportForm.subject_scores.biology) : null
        },
        mock_test: includeMockTest ? {
          exam_name: mockTestForm.exam_name,
          test_date: mockTestForm.test_date,
          total_marks: parseFloat(mockTestForm.total_marks),
          obtained_marks: parseFloat(mockTestForm.obtained_marks),
          rank: mockTestForm.rank ? parseInt(mockTestForm.rank) : null,
          percentile: mockTestForm.percentile ? parseFloat(mockTestForm.percentile) : null,
          subject_breakdown: {
            physics: mockTestForm.subject_breakdown.physics ? parseFloat(mockTestForm.subject_breakdown.physics) : null,
            chemistry: mockTestForm.subject_breakdown.chemistry ? parseFloat(mockTestForm.subject_breakdown.chemistry) : null,
            mathematics: mockTestForm.subject_breakdown.mathematics ? parseFloat(mockTestForm.subject_breakdown.mathematics) : null,
            biology: mockTestForm.subject_breakdown.biology ? parseFloat(mockTestForm.subject_breakdown.biology) : null
          }
        } : null
      };
      
      await api.post(`/admin/progress-report/${selectedStudent}`, reportData);
      
      toast({
        title: "Report Added",
        description: "Progress report has been added successfully",
      });
      
      // Reset forms
      setReportForm({
        attendance_percentage: '',
        class_rank: '',
        total_in_class: '',
        report_text: '',
        report_month: '',
        funding_utilized_this_month: '',
        subject_scores: { physics: '', chemistry: '', mathematics: '', biology: '' },
        mock_test: null
      });
      setMockTestForm({
        exam_name: '',
        test_date: '',
        total_marks: 300,
        obtained_marks: 0,
        rank: '',
        percentile: '',
        subject_breakdown: { physics: '', chemistry: '', mathematics: '', biology: '' }
      });
      setIncludeMockTest(false);
      setSelectedStudent(null);
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.detail || "Failed to add progress report",
      });
    }
  };

  const handleSelectStudentForManage = (studentId) => {
    setSelectedStudent(studentId);
    fetchStudentDetails(studentId);
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <AnimatedCard delay={100} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-blue-600">
                {stats.total_students || 0}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={150} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                </div>
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-emerald-600">
                {stats.verified_students || 0}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-full">
                  <Clock className="h-3 w-3 text-amber-600" />
                </div>
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-amber-600">
                {stats.pending_students || 0}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={250} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <div className="p-1.5 bg-rose-100 rounded-full">
                  <Heart className="h-3 w-3 text-rose-600" />
                </div>
                Sponsored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-rose-600">
                {stats.sponsored_students || 0}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-full">
                  <Target className="h-3 w-3 text-indigo-600" />
                </div>
                JEE Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-indigo-600">
                {stats.jee_students || 0}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={350} className="bg-white shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-full">
                  <BookOpen className="h-3 w-3 text-purple-600" />
                </div>
                NEET Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-purple-600">
                {stats.neet_students || 0}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        <Tabs defaultValue="verify" className="space-y-6">
          <TabsList className="bg-white border flex-wrap">
            <TabsTrigger value="verify" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="verify-tab">
              <Users className="h-4 w-4 mr-2" />
              Verify Students
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="progress-tab">
              <TrendingUp className="h-4 w-4 mr-2" />
              Add Progress
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="manage-tab">
              <Settings className="h-4 w-4 mr-2" />
              Manage Student
            </TabsTrigger>
            <TabsTrigger value="sponsored" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="sponsored-tab">
              <Heart className="h-4 w-4 mr-2" />
              Sponsored
            </TabsTrigger>
            <TabsTrigger value="csr-partners" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="csr-partners-tab">
              <Briefcase className="h-4 w-4 mr-2" />
              CSR Partners
            </TabsTrigger>
            <TabsTrigger value="credentials" className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white" data-testid="credentials-tab">
              <Shield className="h-4 w-4 mr-2" />
              User Credentials
            </TabsTrigger>
          </TabsList>

          {/* Verify Students Tab */}
          <TabsContent value="verify">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Student Verifications</CardTitle>
                <CardDescription>Review and verify student documents</CardDescription>
                
                {/* Search and Filter */}
                <div className="flex gap-4 mt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, school..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                  >
                    <option value="all">All Students</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <p className="text-gray-600">No students found</p>
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
                            <Badge className={`${
                              student.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                              student.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {student.verification_status?.toUpperCase()}
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
                                {student.coaching_details && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Coaching:</span>
                                    <Badge className="bg-indigo-100 text-indigo-800">
                                      {student.coaching_details.coaching_type}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-700 mb-3">Uploaded Documents</h4>
                              <div className="space-y-2">
                                {documents.length === 0 ? (
                                  <p className="text-sm text-gray-500">No documents uploaded</p>
                                ) : (
                                  documents.map((doc) => (
                                    <div key={doc.doc_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-sm">
                                      <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                        <div>
                                          <p className="text-sm font-medium capitalize">{doc.document_type.replace('_', ' ')}</p>
                                          <p className="text-xs text-gray-500">{doc.document_name}</p>
                                        </div>
                                      </div>
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                                        Uploaded
                                      </Badge>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          {student.verification_status === 'pending' && (
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
                          )}
                        </CardContent>
                      </AnimatedCard>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Progress Tab */}
          <TabsContent value="progress">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Add Progress Report</CardTitle>
                <CardDescription>Upload monthly progress data for sponsored students</CardDescription>
              </CardHeader>
              <CardContent>
                {sponsoredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No sponsored students yet</p>
                    <p className="text-sm text-gray-500">Students must be verified and sponsored before adding progress reports</p>
                  </div>
                ) : (
                  <form onSubmit={handleAddReport} className="space-y-6">
                    {/* Student Selection */}
                    <div>
                      <Label htmlFor="student_select">Select Student</Label>
                      <select
                        id="student_select"
                        value={selectedStudent || ''}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        required
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-marigold focus:outline-none focus:ring-2 focus:ring-marigold"
                        data-testid="student-select"
                      >
                        <option value="">-- Select a sponsored student --</option>
                        {sponsoredStudents.map(({ student, company_name }) => (
                          <option key={student.student_id} value={student.student_id}>
                            {student.full_name} - {student.school_name} (Sponsored by: {company_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Report Month */}
                    <div>
                      <Label htmlFor="report_month">Report Month</Label>
                      <Input
                        id="report_month"
                        type="month"
                        value={reportForm.report_month}
                        onChange={(e) => setReportForm({...reportForm, report_month: e.target.value})}
                        required
                        className="mt-1"
                        data-testid="report-month"
                      />
                    </div>

                    {/* Basic Performance */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Attendance %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="e.g., 92"
                          value={reportForm.attendance_percentage}
                          onChange={(e) => setReportForm({...reportForm, attendance_percentage: e.target.value})}
                          data-testid="attendance-input"
                        />
                      </div>
                      <div>
                        <Label>Class Rank</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 15"
                          value={reportForm.class_rank}
                          onChange={(e) => setReportForm({...reportForm, class_rank: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Total in Class</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 120"
                          value={reportForm.total_in_class}
                          onChange={(e) => setReportForm({...reportForm, total_in_class: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Subject Scores */}
                    <div>
                      <Label className="mb-2 block">Subject Scores (out of 100)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(reportForm.subject_scores).map(([subject, score]) => (
                          <div key={subject}>
                            <Label className="text-xs capitalize">{subject}</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={score}
                              onChange={(e) => setReportForm({
                                ...reportForm,
                                subject_scores: { ...reportForm.subject_scores, [subject]: e.target.value }
                              })}
                              placeholder="Score"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Funding */}
                    <div>
                      <Label>Funding Utilized This Month (₹)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 12500"
                        value={reportForm.funding_utilized_this_month}
                        onChange={(e) => setReportForm({...reportForm, funding_utilized_this_month: e.target.value})}
                      />
                    </div>

                    {/* Mock Test Toggle */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeMockTest}
                          onChange={(e) => setIncludeMockTest(e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span className="font-semibold text-purple-800">Include Mock Test Result</span>
                      </label>

                      {includeMockTest && (
                        <div className="mt-4 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Exam Name</Label>
                              <Input
                                value={mockTestForm.exam_name}
                                onChange={(e) => setMockTestForm({...mockTestForm, exam_name: e.target.value})}
                                placeholder="e.g., JEE Main Mock Test 5"
                              />
                            </div>
                            <div>
                              <Label>Test Date</Label>
                              <Input
                                type="date"
                                value={mockTestForm.test_date}
                                onChange={(e) => setMockTestForm({...mockTestForm, test_date: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label>Total Marks</Label>
                              <Input
                                type="number"
                                value={mockTestForm.total_marks}
                                onChange={(e) => setMockTestForm({...mockTestForm, total_marks: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label>Obtained Marks</Label>
                              <Input
                                type="number"
                                value={mockTestForm.obtained_marks}
                                onChange={(e) => setMockTestForm({...mockTestForm, obtained_marks: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label>Rank</Label>
                              <Input
                                type="number"
                                value={mockTestForm.rank}
                                onChange={(e) => setMockTestForm({...mockTestForm, rank: e.target.value})}
                                placeholder="Optional"
                              />
                            </div>
                            <div>
                              <Label>Percentile</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={mockTestForm.percentile}
                                onChange={(e) => setMockTestForm({...mockTestForm, percentile: e.target.value})}
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comments */}
                    <div>
                      <Label>Teacher's Comment</Label>
                      <Textarea
                        placeholder="Student is showing excellent progress..."
                        value={reportForm.report_text}
                        onChange={(e) => setReportForm({...reportForm, report_text: e.target.value})}
                        rows={3}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Student Tab */}
          <TabsContent value="manage">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Student List */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Select Student</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  <div className="space-y-2">
                    {sponsoredStudents.map(({ student, company_name }) => (
                      <button
                        key={student.student_id}
                        onClick={() => handleSelectStudentForManage(student.student_id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedStudent === student.student_id
                            ? 'bg-indigo-100 border-2 border-indigo-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={student.full_name} size="sm" />
                          <div>
                            <p className="font-medium text-sm">{student.full_name}</p>
                            <p className="text-xs text-gray-500">{company_name}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Student Forms */}
              <div className="md:col-span-2">
                {selectedStudentDetails ? (
                  <AdminStudentForms 
                    student={selectedStudentDetails.student} 
                    onUpdate={() => {
                      fetchStudentDetails(selectedStudent);
                      fetchData();
                    }}
                  />
                ) : (
                  <Card className="bg-white">
                    <CardContent className="py-12 text-center text-gray-500">
                      <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      Select a sponsored student to manage their details
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sponsored Students Tab */}
          <TabsContent value="sponsored">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Sponsored Students</CardTitle>
                <CardDescription>View all sponsored students and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                {sponsoredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No sponsored students yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sponsoredStudents.map(({ student, company_name }) => (
                      <StudentProfileCard
                        key={student.student_id}
                        student={student}
                        companyName={company_name}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CSR Partners Tab */}
          <TabsContent value="csr-partners">
            <CSRPartners />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
