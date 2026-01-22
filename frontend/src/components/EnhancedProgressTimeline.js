import React, { useState } from 'react';
import { 
  Calendar, TrendingUp, BookOpen, Users, DollarSign,
  ChevronDown, ChevronUp, Award, FileText, CheckCircle
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const EnhancedProgressTimeline = ({ reports, student }) => {
  const [expandedReports, setExpandedReports] = useState({});

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No progress reports yet</p>
        <p className="text-xs text-gray-400 mt-1">Reports will appear here once added by admin</p>
      </div>
    );
  }

  const toggleExpand = (reportId) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getScoreColor = (score, total = 100) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-emerald-600 bg-emerald-100';
    if (percentage >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-amber-500 to-emerald-500"></div>

      <div className="space-y-6">
        {reports.map((report, index) => {
          const isExpanded = expandedReports[report.report_id];
          const hasSubjectScores = report.subject_scores && Object.values(report.subject_scores).some(v => v !== null);
          const hasMockTest = report.mock_test;
          
          return (
            <div key={report.report_id || index} className="relative pl-10" data-testid={`progress-report-${report.report_id}`}>
              {/* Timeline dot */}
              <div className="absolute left-2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-lg transform -translate-x-1/2"></div>
              
              {/* Report Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                {/* Header - Always visible */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(report.report_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      <span className="font-semibold text-indigo-950">{report.report_month}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasMockTest && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Mock Test
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    {report.attendance_percentage && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-gray-600">Attendance:</span>
                        <span className="font-semibold">{report.attendance_percentage}%</span>
                      </div>
                    )}
                    {report.class_rank && report.total_in_class && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">Rank:</span>
                        <span className="font-semibold">{report.class_rank}/{report.total_in_class}</span>
                      </div>
                    )}
                    {report.funding_utilized_this_month && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-amber-500" />
                        <span className="text-gray-600">Used:</span>
                        <span className="font-semibold">{formatCurrency(report.funding_utilized_this_month)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4 animate-fade-in">
                    {/* Subject Scores */}
                    {hasSubjectScores && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          Subject Scores
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(report.subject_scores).map(([subject, score]) => (
                            score !== null && (
                              <div key={subject} className={`rounded-lg p-2 ${getScoreColor(score)}`}>
                                <span className="text-xs capitalize">{subject}</span>
                                <p className="font-bold text-lg">{score}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mock Test Details */}
                    {hasMockTest && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Mock Test: {report.mock_test.exam_name}
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-medium">{report.mock_test.test_date}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <p className="font-bold text-purple-700">
                              {report.mock_test.obtained_marks}/{report.mock_test.total_marks}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Rank:</span>
                            <p className="font-medium">{report.mock_test.rank || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Percentile:</span>
                            <p className="font-medium">{report.mock_test.percentile || 'N/A'}%</p>
                          </div>
                        </div>
                        
                        {/* Subject Breakdown in Mock Test */}
                        {report.mock_test.subject_breakdown && (
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <span className="text-xs text-purple-600 font-medium">Subject-wise:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(report.mock_test.subject_breakdown).map(([subject, score]) => (
                                score !== null && (
                                  <span key={subject} className="text-xs bg-white rounded px-2 py-1">
                                    {subject}: <strong>{score}</strong>
                                  </span>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Funding Breakdown */}
                    {report.funding_breakdown_this_month && Object.keys(report.funding_breakdown_this_month).length > 0 && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Funding Utilized This Month
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(report.funding_breakdown_this_month).map(([item, amount]) => (
                            amount > 0 && (
                              <span key={item} className="text-xs bg-white rounded px-2 py-1">
                                {item}: <strong>{formatCurrency(amount)}</strong>
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teacher's Comment */}
                    {report.report_text && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          Teacher's Comment
                        </h5>
                        <p className="text-sm text-gray-600 italic">"{report.report_text}"</p>
                      </div>
                    )}

                    {/* Report Meta */}
                    <div className="text-xs text-gray-400 text-right">
                      Added: {new Date(report.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More - if needed */}
      {reports.length >= 10 && (
        <div className="text-center mt-4 pl-10">
          <button className="text-sm text-indigo-600 hover:text-indigo-800">
            Load More Timeline...
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedProgressTimeline;
