import React, { useState, useEffect } from 'react';
import { 
  FileText, DollarSign, Download, Calendar, CheckCircle,
  TrendingUp, Award, Building2, Users, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

const TaxCompliance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/company/tax-compliance');
      setData(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tax compliance data",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 3) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const summary = data?.financial_summary || {};
  const certificates = data?.certificates_80g || [];
  const partnership = data?.partnership;
  const studentsSponsored = data?.students_sponsored || 0;

  const utilizationRate = summary.total_commitment > 0 
    ? (summary.disbursed_to_ngo / summary.total_commitment) * 100 
    : 0;

  return (
    <div className="space-y-6" data-testid="tax-compliance-section">
      {/* Financial Summary Header */}
      <Card className="bg-gradient-to-r from-indigo-950 to-indigo-900 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-400" />
            Financial Summary - FY {getCurrentFY()}
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your CSR contribution overview and tax benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Total CSR Commitment</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(summary.total_commitment)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Disbursed to NGO</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(summary.disbursed_to_ngo)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Tax Benefit (80G - 50%)</p>
              <p className="text-3xl font-bold text-amber-400">{formatCurrency(summary.tax_benefit_80g)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Fund Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Fund Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Disbursed: {formatCurrency(summary.disbursed_to_ngo)}</span>
                  <span className="font-medium">{utilizationRate.toFixed(0)}%</span>
                </div>
                <Progress value={utilizationRate} className="h-3" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Student Utilization</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(summary.student_utilization)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Admin Fee (10%)</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(summary.admin_fee)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Balance Remaining</span>
                  </div>
                  <span className="font-semibold text-emerald-600">{formatCurrency(summary.balance_remaining)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-white rounded-lg">
              <div className="text-6xl font-bold text-amber-600 mb-2">{studentsSponsored}</div>
              <p className="text-gray-600 mb-4">Students Sponsored</p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="px-4 py-2 bg-white rounded-full shadow-sm">
                  <span className="text-gray-500">Impact Score:</span>
                  <span className="font-bold text-indigo-600 ml-1">{studentsSponsored * 100}</span>
                </div>
              </div>
            </div>

            {partnership && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-sm text-indigo-800 mb-2">Partnership Status</h4>
                <div className="flex items-center justify-between">
                  <Badge className={`${partnership.partnership_status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'} text-white`}>
                    {partnership.partnership_status?.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Tier: <span className="font-semibold">{partnership.partnership_tier}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Valid: {partnership.start_date} to {partnership.end_date}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 80G Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            80G Tax Exemption Certificates
          </CardTitle>
          <CardDescription>
            Download your 80G certificates for tax filing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No 80G certificates issued yet</p>
              <p className="text-sm text-gray-400 mt-1">Certificates are issued after fund disbursement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  data-testid={`certificate-${cert.certificate_number}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-indigo-950">{cert.certificate_number}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {cert.issue_date}
                        </span>
                        <span>•</span>
                        <span>FY {cert.financial_year}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(cert.amount)}</p>
                      <p className="text-xs text-gray-500">Tax Benefit: {formatCurrency(cert.amount * 0.5)}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Important Tax Information</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 80G certificates are valid for 50% tax deduction on donated amount</li>
                <li>• Certificates can be used while filing ITR</li>
                <li>• Keep records of all disbursement receipts for audit purposes</li>
                <li>• CSR spending must be reported in CSR-1 form annually</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCompliance;
