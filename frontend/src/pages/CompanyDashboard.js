import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, LogOut, Heart, TrendingUp, FileText, CheckCircle, 
  Star, Info, Filter, Target, BookOpen, DollarSign, Award,
  ChevronDown, ChevronUp
} from 'lucide-react';
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
import EnhancedProgressTimeline from '../components/EnhancedProgressTimeline';
import StudentProfileCard from '../components/StudentProfileCard';

const CompanyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [sponsoredStudents, setSponsoredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPercentage, setMinPercentage] = useState('');
  const [coachingType, setCoachingType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [expandedStudents, setExpandedStudents] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, minPercentage, coachingType]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (minPercentage) params.append('min_percentage', minPercentage);
      if (coachingType) params.append('coaching_type', coachingType);
      
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

  const toggleStudentExpand = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calculate total stats
  const totalFundsAllocated = sponsoredStudents.reduce((sum, { student }) => {
    return sum + (student?.funding_details?.total_amount_allocated || 0);
  }, 0);

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
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <AnimatedCard delay={100} className="border-amber-100 shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Heart className="h-4 w-4 text-emerald-600" />
                </div>
                Students Sponsored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-emerald-600">
                {sponsoredStudents.length}
              </div>
              <p className="text-xs text-gray-500">Active sponsorships</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="border-amber-100 shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                Available Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-blue-600">
                {pagination.total || 0}
              </div>
              <p className="text-xs text-gray-500">Verified & awaiting</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="border-amber-100 shadow-md hover:shadow-xl hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                Total Funds Allocated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-purple-600">
                {formatCurrency(totalFundsAllocated)}
              </div>
              <p className="text-xs text-gray-500">CSR investment</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="border-amber-100 shadow-md hover:shadow-xl hover-lift relative group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
                Impact Score
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-amber-600">
                {sponsoredStudents.length * 100}
              </div>
              <p className="text-xs text-gray-500">100 pts per student</p>
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
              Sponsored ({sponsoredStudents.length})
            </TabsTrigger>
          </TabsList>

          {/* Browse Students Tab */}
          <TabsContent value="browse">
            <Card className="border-amber-100">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-indigo-950">Available Students</CardTitle>
                <CardDescription>Browse verified students looking for sponsorship</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search by name, email, school, institute..."
                      className="flex-1 min-w-[200px]"
                    />
                    <select
                      value={minPercentage}
                      onChange={(e) => setMinPercentage(e.target.value)}
                      className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-marigold"
                    >
                      <option value="">All Scores</option>
                      <option value="90">90%+ Score</option>
                      <option value="80">80%+ Score</option>
                      <option value="70">70%+ Score</option>
                    </select>
                    <select
                      value={coachingType}
                      onChange={(e) => setCoachingType(e.target.value)}
                      className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-marigold"
                    >
                      <option value="">All Coaching</option>
                      <option value="IIT-JEE">IIT-JEE</option>
                      <option value="NEET">NEET</option>
                      <option value="JEE+NEET">JEE+NEET</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-12 w-12 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-indigo-950 mb-2">
                      No Students Found
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {searchTerm || minPercentage || coachingType 
                        ? "Try adjusting your filters to find more students."
                        : "Students are currently being verified. Check back soon!"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {students.map((student) => {
                        const isExpanded = expandedStudents[student.student_id];
                        const coaching = student.coaching_details;
                        
                        return (
                          <AnimatedCard 
                            key={student.student_id} 
                            className="border-amber-100 hover:shadow-xl transition-all" 
                            data-testid={`student-card-${student.student_id}`}
                          >
                            {/* Collapsed View */}
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Avatar name={student.full_name} size="lg" />
                                  <div>
                                    <h3 className="font-semibold text-lg text-indigo-950">{student.full_name}</h3>
                                    <p className="text-sm text-gray-600">{student.school_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className="bg-amber-100 text-amber-800">
                                        <Award className="h-3 w-3 mr-1" />
                                        {student.class_10_percentage}%
                                      </Badge>
                                      {coaching && (
                                        <Badge className="bg-indigo-100 text-indigo-800">
                                          <Target className="h-3 w-3 mr-1" />
                                          {coaching.coaching_type}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <Button 
                                    onClick={() => handleSponsor(student.student_id)}
                                    className="bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full"
                                    data-testid={`sponsor-btn-${student.student_id}`}
                                  >
                                    <Heart className="h-4 w-4 mr-2" />
                                    Sponsor
                                  </Button>
                                  <button
                                    onClick={() => toggleStudentExpand(student.student_id)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-gray-500" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold text-gray-700 mb-2">Contact & Basic Info</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-500">Email:</span> {student.email}</p>
                                        <p><span className="text-gray-500">Phone:</span> {student.phone}</p>
                                        <p><span className="text-gray-500">DOB:</span> {student.date_of_birth}</p>
                                        <p><span className="text-gray-500">Address:</span> {student.address}</p>
                                      </div>
                                    </div>
                                    
                                    {coaching && (
                                      <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">Coaching Details</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="text-gray-500">Institute:</span> {coaching.institute_name}</p>
                                          <p><span className="text-gray-500">Location:</span> {coaching.institute_location}</p>
                                          <p><span className="text-gray-500">Duration:</span> {coaching.course_duration}</p>
                                          <p><span className="text-gray-500">Batch:</span> {coaching.batch_year}</p>
                                          <p><span className="text-gray-500">Target:</span> {coaching.expected_exam_date}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AnimatedCard>
                        );
                      })}
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

          {/* Sponsored Students Tab */}
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
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sponsoredStudents.map(({ student, sponsorship, progress_reports }) => (
                      <Card key={student.student_id} className="border-gray-200 overflow-hidden" data-testid={`sponsored-card-${student.student_id}`}>
                        {/* Student Profile Header */}
                        <StudentProfileCard student={student} />
                        
                        {/* Progress Timeline */}
                        <div className="p-6 bg-gray-50 border-t">
                          <h4 className="font-semibold text-indigo-950 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Progress Timeline
                          </h4>
                          <EnhancedProgressTimeline reports={progress_reports} student={student} />
                        </div>
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
