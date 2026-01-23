import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Building2, IndianRupee, Trophy,
  ArrowUp, ArrowDown, Calendar, PieChart, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

const AnalyticsDashboard = ({ userRole = 'admin' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [userRole]);

  const fetchAnalytics = async () => {
    try {
      const endpoint = userRole === 'admin' ? '/admin/analytics' : '/company/analytics';
      const response = await api.get(endpoint);
      setAnalytics(response.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load analytics" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return <div className="p-8 text-center text-gray-500">No analytics data available</div>;
  }

  // Admin Analytics View
  if (userRole === 'admin') {
    const { overview, recent_activity, monthly_trends, conversion_rate } = analytics;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-950">Platform Analytics</h2>
            <p className="text-sm text-gray-500">Real-time insights and performance metrics</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-indigo-950">{overview.total_students}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <Badge className="bg-green-100 text-green-700">{overview.verified_students} verified</Badge>
                <Badge className="bg-yellow-100 text-yellow-700">{overview.pending_students} pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sponsored</p>
                  <p className="text-2xl font-bold text-green-600">{overview.sponsored_students}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Conversion: <span className="font-medium text-green-600">{conversion_rate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Companies</p>
                  <p className="text-2xl font-bold text-purple-600">{overview.total_companies}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Active sponsors on platform
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Funds</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(overview.total_funds)}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <IndianRupee className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {overview.success_stories} success stories
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">New Registrations</p>
                      <p className="text-xs text-gray-500">Last 7 days</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{recent_activity.new_registrations_7d}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Trophy className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">New Sponsorships</p>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{recent_activity.new_sponsorships_30d}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthly_trends?.map((month, idx) => (
                  <div key={month.month} className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-16">{month.month}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-blue-500 rounded-l-full"
                        style={{ width: `${Math.min((month.students / 10) * 100, 100)}%` }}
                        title={`${month.students} students`}
                      />
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min((month.sponsorships / 5) * 100, 50)}%` }}
                        title={`${month.sponsorships} sponsorships`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 w-20 text-right">
                      {month.students}S / {month.sponsorships}Sp
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Students
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span> Sponsorships
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Company Analytics View
  const { overview, student_progress, packages } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-indigo-950">Your Impact Analytics</h2>
          <p className="text-sm text-gray-500">Track your sponsorship performance</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Students Sponsored</p>
                <p className="text-2xl font-bold text-indigo-950">{overview.total_sponsored}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(overview.total_invested)}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Packages</p>
                <p className="text-2xl font-bold text-purple-600">{overview.active_packages}</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Slots Used</p>
                <p className="text-2xl font-bold text-amber-600">{overview.filled_slots}/{overview.total_slots}</p>
              </div>
              <Trophy className="h-8 w-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Progress */}
      {student_progress?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Student Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student_progress.map(student => (
                <div key={student.student_id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-gray-500">Base Score: {student.base_score}%</p>
                    </div>
                    <Badge className={student.reports?.length > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {student.reports?.length || 0} Reports
                    </Badge>
                  </div>
                  {student.reports?.length > 0 && (
                    <div className="flex items-center gap-2">
                      {student.reports.slice(0, 6).map((report, idx) => (
                        <div 
                          key={idx}
                          className="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden"
                          title={`${report.month}: ${report.attendance_percentage?.toFixed(0) || 0}% attendance`}
                        >
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all"
                            style={{ height: `${report.attendance_percentage || 0}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
