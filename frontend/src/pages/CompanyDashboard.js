import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, LogOut, Heart, TrendingUp, FileText, CheckCircle, Star, Info, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';
import Avatar from '../components/Avatar';
import AnimatedCard from '../components/AnimatedCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ProgressTimeline from '../components/ProgressTimeline';

const CompanyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [sponsoredStudents, setSponsoredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPercentage, setMinPercentage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, minPercentage]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (minPercentage) params.append('min_percentage', minPercentage);
      
      const [studentsRes, sponsoredRes] = await Promise.all([
        api.get(`/company/students?${params.toString()}`),
        api.get('/company/sponsored-students')
      ]);
      
      setStudents(studentsRes.data.students || []);
      setPagination(studentsRes.data.pagination || {});
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
          <AnimatedCard delay={100} className="border-amber-100 shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Heart className="h-5 w-5 text-emerald-600" />
                </div>
                Total Sponsored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-heading font-bold text-emerald-600">
                  {sponsoredStudents.length}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Students</p>
                  <p className="text-xs text-emerald-600 font-semibold">Active</p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="border-amber-100 shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                Available Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-heading font-bold text-blue-600">
                  {students.length}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Students</p>
                  <p className="text-xs text-blue-600 font-semibold">Verified</p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="border-amber-100 shadow-md hover:shadow-xl hover-lift relative group">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                Impact Score
                <div className="relative">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-indigo-950 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <p className="font-semibold mb-1">Impact Score Calculation:</p>
                    <p>100 points per sponsored student. Higher score shows greater educational impact.</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-indigo-950"></div>
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-heading font-bold text-amber-600">
                  {sponsoredStudents.length * 100}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Points</p>
                  <p className="text-xs text-amber-600 font-semibold">Growing</p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
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
                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex gap-4">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search by name, email, or school..."
                      className="flex-1"
                    />
                    <select
                      value={minPercentage}
                      onChange={(e) => setMinPercentage(e.target.value)}
                      className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-marigold"
                    >
                      <option value="">All Percentages</option>
                      <option value="90">90% and above</option>
                      <option value="80">80% and above</option>
                      <option value="70">70% and above</option>
                      <option value="60">60% and above</option>
                    </select>
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-12 w-12 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-indigo-950 mb-2">
                      No Students Available Yet
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Students are currently being verified by our admin team. Once approved, they'll appear here for sponsorship.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-amber-800 font-semibold mb-2">
                        Get Notified
                      </p>
                      <p className="text-xs text-amber-700">
                        We'll send you an email as soon as verified students become available for sponsorship.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {students.map((student) => (
                        <AnimatedCard key={student.student_id} className="border-amber-100 hover:shadow-xl hover-lift" data-testid={`student-card-${student.student_id}`}>
                          <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar name={student.full_name} size="lg" />
                              <div className="flex-1">
                                <CardTitle className="text-lg">{student.full_name}</CardTitle>
                                <CardDescription>{student.school_name}</CardDescription>
                              </div>
                            </div>
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
                        </AnimatedCard>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {pagination.total > 0 && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.total_pages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={setCurrentPage}
                        className="mt-6"
                      />
                    )}
                  </>
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
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="h-12 w-12 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-indigo-950 mb-2">
                      Start Your Impact Journey
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      You haven't sponsored any students yet. Be the catalyst that transforms a deserving student's future.
                    </p>
                    <Button 
                      onClick={() => document.querySelector('[value="browse"]').click()}
                      className="bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Browse Students
                    </Button>
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Did You Know?
                      </p>
                      <p className="text-xs text-blue-800">
                        Companies like yours have sponsored over {students.length + sponsoredStudents.length} students, helping them achieve their IIT/NEET dreams.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sponsoredStudents.map(({ student, sponsorship, progress_reports }) => (
                      <AnimatedCard key={student.student_id} className="border-amber-100 hover:shadow-xl hover-lift" data-testid={`sponsored-card-${student.student_id}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar name={student.full_name} size="lg" />
                              <div>
                                <CardTitle className="text-xl">{student.full_name}</CardTitle>
                                <CardDescription>{student.school_name}</CardDescription>
                              </div>
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
                      </AnimatedCard>
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
