import React from 'react';
import { TrendingUp, Users, School, Award, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AnalyticsDashboard = ({ stats = {}, topSchools = [], topCompanies = [], monthlyTrends = [] }) => {
  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BarChart = ({ data, title, color = 'bg-marigold' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={stats.total_students || 0}
          change={12}
          icon={Users}
          color="text-blue-600"
        />
        <MetricCard
          title="Verified Students"
          value={stats.verified_students || 0}
          change={8}
          icon={Award}
          color="text-emerald-600"
        />
        <MetricCard
          title="Sponsored"
          value={stats.sponsored_students || 0}
          change={15}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <MetricCard
          title="Active Companies"
          value={stats.total_companies || 0}
          change={5}
          icon={School}
          color="text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <BarChart
          title="Top Schools by Student Count"
          data={topSchools}
          color="bg-blue-500"
        />
        <BarChart
          title="Most Active Companies"
          data={topCompanies}
          color="bg-purple-500"
        />
      </div>

      {/* Monthly Trend */}
      {monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {monthlyTrends.map((month, index) => {
                const maxHeight = Math.max(...monthlyTrends.map(m => m.count), 1);
                const height = (month.count / maxHeight) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs font-bold text-gray-700 mb-1">{month.count}</div>
                    <div
                      className="w-full bg-gradient-to-t from-marigold to-amber-400 rounded-t transition-all duration-500 hover:opacity-80"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-600 mt-2 rotate-45 origin-left">{month.month}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.verified_students && stats.total_students 
                  ? Math.round((stats.verified_students / stats.total_students) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Verification Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {stats.verified_students && stats.sponsored_students
                  ? Math.round((stats.sponsored_students / stats.verified_students) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Sponsorship Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.sponsored_students * 100 || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Impact Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
