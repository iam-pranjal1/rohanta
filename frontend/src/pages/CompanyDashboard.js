import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, LogOut, Heart, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

const CompanyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [sponsoredStudents, setSponsoredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, sponsoredRes] = await Promise.all([
        api.get('/company/students'),
        api.get('/company/sponsored-students')
      ]);
      
      setStudents(studentsRes.data.students || []);
      setSponsoredStudents(sponsoredRes.data.sponsored_students || []);
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

  const handleSponsor = async (studentId) => {
    try {
      await api.post(`/company/sponsor/${studentId}`);
      
      toast({
        title: "Sponsorship Successful",
        description: "You are now sponsoring this student!",
      });
      
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sponsorship Failed",
        description: error.response?.data?.detail || "Failed to sponsor student",
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
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white" data-testid="company-dashboard">
      {/* Header */}
      <div className="bg-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-marigold" />
              <span className="font-heading text-2xl font-bold">Company Dashboard</span>
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-lg">Total Sponsored</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-heading font-bold text-marigold">
                {sponsoredStudents.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-lg">Available Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-heading font-bold text-indigo-950">
                {students.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-lg">Impact Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-heading font-bold text-emerald-600">
                {sponsoredStudents.length * 100}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="bg-white border border-amber-100">
            <TabsTrigger value="browse" className="data-[state=active]:bg-marigold data-[state=active]:text-indigo-950" data-testid="browse-students-tab">
              <Users className="h-4 w-4 mr-2" />
              Browse Students
            </TabsTrigger>
            <TabsTrigger value="sponsored" className="data-[state=active]:bg-marigold data-[state=active]:text-indigo-950" data-testid="sponsored-students-tab">
              <Heart className="h-4 w-4 mr-2" />
              Sponsored Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <Card className="border-amber-100">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Available Students</CardTitle>
                <CardDescription>Browse verified students looking for sponsorship</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No students available for sponsorship at the moment</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {students.map((student) => (
                      <Card key={student.student_id} className="border-amber-100 hover:shadow-lg transition-all" data-testid={`student-card-${student.student_id}`}>
                        <CardHeader>
                          <CardTitle className="text-lg">{student.full_name}</CardTitle>
                          <CardDescription>{student.school_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Class 10 Score:</span>
                              <span className="font-semibold text-marigold">{student.class_10_percentage}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Email:</span>
                              <span className="text-sm font-medium">{student.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Phone:</span>
                              <span className="text-sm font-medium">{student.phone}</span>
                            </div>
                            <div className="pt-4">
                              <Button 
                                onClick={() => handleSponsor(student.student_id)}
                                className="w-full bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full"
                                data-testid={`sponsor-btn-${student.student_id}`}
                              >
                                <Heart className="h-4 w-4 mr-2" />
                                Sponsor This Student
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsored">
            <Card className="border-amber-100">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Your Sponsored Students</CardTitle>
                <CardDescription>Track the progress of students you're sponsoring</CardDescription>
              </CardHeader>
              <CardContent>
                {sponsoredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't sponsored any students yet</p>
                    <Button 
                      onClick={() => document.querySelector('[value="browse"]').click()}
                      className="bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full"
                    >
                      Browse Students
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sponsoredStudents.map(({ student, sponsorship, progress_reports }) => (
                      <Card key={student.student_id} className="border-amber-100" data-testid={`sponsored-card-${student.student_id}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl">{student.full_name}</CardTitle>
                              <CardDescription>{student.school_name}</CardDescription>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              ACTIVE
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Student Info */}
                            <div>
                              <h4 className="font-semibold text-indigo-950 mb-3">Student Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Email:</span>
                                  <span className="text-sm font-medium">{student.email}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Phone:</span>
                                  <span className="text-sm font-medium">{student.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Class 10:</span>
                                  <span className="text-sm font-medium text-marigold">{student.class_10_percentage}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Reports */}
                            <div>
                              <h4 className="font-semibold text-indigo-950 mb-3">Latest Progress</h4>
                              {progress_reports.length === 0 ? (
                                <p className="text-sm text-gray-600">No progress reports yet</p>
                              ) : (
                                <div className="space-y-3">
                                  {progress_reports.slice(0, 2).map((report) => (
                                    <div key={report.report_id} className="bg-amber-50 p-3 rounded-sm">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-indigo-950">{report.report_month}</span>
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                      </div>
                                      {report.attendance_percentage && (
                                        <div className="mb-2">
                                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                            <span>Attendance</span>
                                            <span>{report.attendance_percentage}%</span>
                                          </div>
                                          <Progress value={report.attendance_percentage} className="h-1" />
                                        </div>
                                      )}
                                      {report.report_text && (
                                        <p className="text-xs text-gray-600">{report.report_text.substring(0, 100)}...</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDashboard;
