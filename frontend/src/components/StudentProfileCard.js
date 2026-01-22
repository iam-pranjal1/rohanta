import React, { useState } from 'react';
import { 
  GraduationCap, MapPin, Calendar, Phone, Mail, Award, 
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  BookOpen, Target, Clock, CheckCircle, Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import Avatar from './Avatar';

const StudentProfileCard = ({ student, companyName }) => {
  const [expanded, setExpanded] = useState(false);

  if (!student) return null;

  const coaching = student.coaching_details;
  const funding = student.funding_details;
  const examPerformance = student.exam_performance;

  // Calculate funding progress
  const fundingProgress = funding?.total_amount_allocated > 0 
    ? ((funding?.amount_utilized || 0) / funding.total_amount_allocated) * 100 
    : 0;

  // Get latest mock test trend
  const mockTests = examPerformance?.mock_tests || [];
  const latestMockTests = mockTests.slice(-5);
  const trend = latestMockTests.length >= 2 
    ? latestMockTests[latestMockTests.length - 1]?.obtained_marks > latestMockTests[latestMockTests.length - 2]?.obtained_marks
      ? 'up' : 'down'
    : 'neutral';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <Card className="border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300" data-testid={`student-profile-${student.student_id}`}>
      {/* Header Section */}
      <CardHeader className="bg-gradient-to-r from-indigo-950 to-indigo-900 text-white rounded-t-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={student.full_name} size="xl" className="border-2 border-amber-400" />
            <div>
              <CardTitle className="text-xl font-heading">{student.full_name}</CardTitle>
              <div className="flex items-center gap-2 text-amber-300 text-sm mt-1">
                <Mail className="h-4 w-4" />
                {student.email}
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Phone className="h-4 w-4" />
                {student.phone}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={`${student.is_sponsored ? 'bg-emerald-500' : 'bg-amber-500'} text-white mb-2`}>
              {student.is_sponsored ? 'SPONSORED' : 'AWAITING SPONSOR'}
            </Badge>
            {companyName && (
              <p className="text-xs text-gray-300 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {companyName}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2">
              <Award className="h-5 w-5 text-amber-400" />
              <span className="text-2xl font-bold text-amber-400">{student.class_10_percentage}%</span>
            </div>
            <p className="text-xs text-gray-400">Class 10 Score</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              <span className="text-sm">{student.school_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span className="text-sm">{student.address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span className="text-sm">DOB: {student.date_of_birth}</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          {mockTests.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Latest Mock Performance</span>
                {trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
              <div className="text-2xl font-bold text-indigo-950">
                {mockTests[mockTests.length - 1]?.obtained_marks}/{mockTests[mockTests.length - 1]?.total_marks}
              </div>
              <p className="text-xs text-gray-500">
                Rank: {mockTests[mockTests.length - 1]?.rank || 'N/A'} | 
                Percentile: {mockTests[mockTests.length - 1]?.percentile || 'N/A'}%
              </p>
            </div>
          )}
        </div>

        {/* Coaching Details */}
        {coaching && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-indigo-950 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Coaching Details
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Institute:</span>
                <p className="font-medium text-indigo-950">{coaching.institute_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="font-medium">{coaching.institute_location}</p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <Badge className="bg-indigo-100 text-indigo-800 ml-2">{coaching.coaching_type}</Badge>
              </div>
              <div>
                <span className="text-gray-600">Batch:</span>
                <p className="font-medium">{coaching.batch_year}</p>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <p className="font-medium">{coaching.course_duration}</p>
              </div>
              <div>
                <span className="text-gray-600">Target Exam:</span>
                <p className="font-medium text-amber-600">{coaching.expected_exam_date}</p>
              </div>
            </div>
          </div>
        )}

        {/* Funding Details */}
        {funding && funding.total_amount_allocated > 0 && (
          <div className="bg-emerald-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-indigo-950 mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Funding Allocation
            </h4>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Total Allocated: {formatCurrency(funding.total_amount_allocated)}</span>
                <span>Utilized: {formatCurrency(funding.amount_utilized)} ({fundingProgress.toFixed(0)}%)</span>
              </div>
              <Progress value={fundingProgress} className="h-3" />
              <p className="text-xs text-gray-500 mt-1">
                Remaining: {formatCurrency(funding.total_amount_allocated - funding.amount_utilized)}
              </p>
            </div>
            
            {/* Funding Breakdown */}
            {funding.funding_breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(funding.funding_breakdown).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} className="bg-white rounded p-2">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                      <p className="font-semibold text-emerald-700">{formatCurrency(value)}</p>
                    </div>
                  )
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Payment Schedule: {funding.payment_schedule}
            </p>
          </div>
        )}

        {/* Expandable Section */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-5 w-5" />
              <span className="text-sm font-medium">Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5" />
              <span className="text-sm font-medium">Show Exam History & More</span>
            </>
          )}
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Mock Tests History */}
            {mockTests.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-950 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  Mock Test History (Last 5)
                </h4>
                <div className="space-y-2">
                  {latestMockTests.reverse().map((test, idx) => (
                    <div key={test.test_id || idx} className="bg-white rounded p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{test.exam_name}</p>
                        <p className="text-xs text-gray-500">{test.test_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-950">{test.obtained_marks}/{test.total_marks}</p>
                        <p className="text-xs text-gray-500">Rank: {test.rank || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actual Exams */}
            {examPerformance?.actual_exams?.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-950 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Actual Exam Results
                </h4>
                <div className="space-y-2">
                  {examPerformance.actual_exams.map((exam, idx) => (
                    <div key={exam.exam_id || idx} className="bg-white rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{exam.exam_name}</p>
                          <p className="text-xs text-gray-500">{exam.exam_date}</p>
                        </div>
                        <Badge className={exam.qualified ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}>
                          {exam.qualified ? 'QUALIFIED' : 'NOT QUALIFIED'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Score:</span>
                          <p className="font-bold">{exam.obtained_marks}/{exam.total_marks}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">AIR:</span>
                          <p className="font-bold">{exam.rank || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Percentile:</span>
                          <p className="font-bold">{exam.percentile || 'N/A'}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Result */}
            {examPerformance?.final_result?.exam_cleared && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 text-white">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  ACHIEVEMENT UNLOCKED!
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-emerald-100">Exam Cleared:</span>
                    <p className="font-bold text-lg">{examPerformance.final_result.exam_name}</p>
                  </div>
                  <div>
                    <span className="text-emerald-100">AIR:</span>
                    <p className="font-bold text-lg">{examPerformance.final_result.final_rank}</p>
                  </div>
                  <div>
                    <span className="text-emerald-100">College:</span>
                    <p className="font-bold">{examPerformance.final_result.college_allotted}</p>
                  </div>
                  <div>
                    <span className="text-emerald-100">Branch/Course:</span>
                    <p className="font-bold">{examPerformance.final_result.branch_course}</p>
                  </div>
                </div>
                <Badge className="bg-white text-emerald-600 mt-2">
                  {examPerformance.final_result.admission_status}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentProfileCard;
