import React from 'react';

const ProgressTimeline = ({ reports = [] }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No progress reports yet</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBar = (score) => {
    const percentage = (score / 100) * 100;
    let colorClass = 'bg-emerald-500';
    if (score < 90) colorClass = 'bg-blue-500';
    if (score < 75) colorClass = 'bg-amber-500';
    if (score < 60) colorClass = 'bg-red-500';
    
    return (
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${colorClass} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    );
  };

  // Sort reports by month (newest first)
  const sortedReports = [...reports].sort((a, b) => {
    return new Date(b.report_month) - new Date(a.report_month);
  });

  return (
    <div className="space-y-6">
      {sortedReports.map((report, index) => {
        const isLatest = index === 0;
        const monthYear = new Date(report.report_month + '-01').toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });

        return (
          <div key={report.report_id} className="relative">
            {/* Timeline line */}
            {index !== sortedReports.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
            )}
            
            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="relative flex-shrink-0">
                <div className={`w-6 h-6 rounded-full border-4 ${
                  isLatest ? 'bg-marigold border-amber-200' : 'bg-white border-gray-300'
                }`} />
              </div>

              {/* Report content */}
              <div className="flex-1 pb-8">
                <div className={`bg-white rounded-lg border ${
                  isLatest ? 'border-marigold shadow-md' : 'border-gray-200'
                } p-5`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-bold text-indigo-950">
                      {monthYear}
                      {isLatest && (
                        <span className="ml-2 text-xs bg-marigold text-indigo-950 px-2 py-1 rounded-full font-semibold">
                          Latest
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Attendance */}
                  {report.attendance_percentage && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Attendance</span>
                        <span className={`text-lg font-bold ${
                          report.attendance_percentage >= 85 ? 'text-emerald-600' : 
                          report.attendance_percentage >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {report.attendance_percentage}%
                        </span>
                      </div>
                      {getScoreBar(report.attendance_percentage)}
                    </div>
                  )}

                  {/* Test Scores */}
                  {report.test_scores && Object.keys(report.test_scores).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Subject Performance</h4>
                      <div className="space-y-2">
                        {Object.entries(report.test_scores).map(([subject, score]) => (
                          <div key={subject} className="flex items-center gap-3">
                            <span className="text-sm w-28 text-gray-600">{subject}</span>
                            <div className="flex items-center gap-2 flex-1">
                              {getScoreBar(score)}
                              <span className={`text-sm font-bold w-12 text-right ${getScoreColor(score)}`}>
                                {score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {report.report_text && (
                    <div className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Teacher's Comment:</p>
                      <p className="text-sm text-gray-600 italic">"{report.report_text}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressTimeline;
