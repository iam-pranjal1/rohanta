import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, DollarSign, Trophy, FileText, Calendar,
  Star, TrendingUp, ChevronDown, ChevronUp, Download, Mail,
  Award, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

const CSRPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPartner, setExpandedPartner] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await api.get('/admin/csr-partners');
      setPartners(response.data.csr_partners || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load CSR partners",
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

  const getTierBadge = (impactScore) => {
    if (impactScore >= 10000) return { label: 'Premium', color: 'bg-purple-500' };
    if (impactScore >= 5000) return { label: 'Gold', color: 'bg-amber-500' };
    if (impactScore >= 2000) return { label: 'Silver', color: 'bg-gray-400' };
    return { label: 'Standard', color: 'bg-blue-400' };
  };

  // Calculate totals
  const totals = partners.reduce((acc, p) => ({
    companies: acc.companies + 1,
    students: acc.students + p.students_sponsored,
    funds: acc.funds + p.total_funds_committed,
    utilized: acc.utilized + p.funds_utilized
  }), { companies: 0, students: 0, funds: 0, utilized: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="csr-partners-section">
      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total CSR Companies</p>
                <p className="text-2xl font-bold text-blue-600">{totals.companies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Students Sponsored</p>
                <p className="text-2xl font-bold text-emerald-600">{totals.students}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-full">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Funds</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(totals.funds)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilization Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totals.funds > 0 ? Math.round((totals.utilized / totals.funds) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners List */}
      <div className="space-y-4">
        {partners.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No CSR partners yet</p>
            </CardContent>
          </Card>
        ) : (
          partners.map((partner) => {
            const tier = getTierBadge(partner.impact_score);
            const isExpanded = expandedPartner === partner.company.company_id;
            const utilizationRate = partner.total_funds_committed > 0 
              ? (partner.funds_utilized / partner.total_funds_committed) * 100 
              : 0;

            return (
              <Card 
                key={partner.company.company_id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`csr-partner-${partner.company.company_id}`}
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{partner.company.company_name}</CardTitle>
                          <Badge className={`${tier.color} text-white`}>
                            <Star className="h-3 w-3 mr-1" />
                            {tier.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {partner.company.email}
                          </span>
                          <span>•</span>
                          <span>{partner.company.industry}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-950">{partner.impact_score}</p>
                      <p className="text-xs text-gray-500">Impact Score</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{partner.students_sponsored}</p>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(partner.total_funds_committed)}</p>
                      <p className="text-xs text-gray-600">Committed</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-lg font-bold text-amber-600">{formatCurrency(partner.funds_utilized)}</p>
                      <p className="text-xs text-gray-600">Utilized</p>
                    </div>
                  </div>

                  {/* Utilization Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Fund Utilization</span>
                      <span className="font-medium">{utilizationRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={utilizationRate} className="h-2" />
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setExpandedPartner(isExpanded ? null : partner.company.company_id)}
                    className="w-full flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 py-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span className="text-sm">Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span className="text-sm">Show Details</span>
                      </>
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="pt-4 border-t mt-4 space-y-4 animate-fade-in">
                      {/* Contact Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Contact Information</h4>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-gray-500">Contact Person:</span> {partner.company.contact_person}</p>
                          <p><span className="text-gray-500">Phone:</span> {partner.company.phone}</p>
                          <p><span className="text-gray-500">Website:</span> {partner.company.website || 'N/A'}</p>
                        </div>
                      </div>

                      {/* 80G Certificates */}
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-emerald-800 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          80G Certificates
                        </h4>
                        {partner.certificates_80g?.length > 0 ? (
                          <div className="space-y-2">
                            {partner.certificates_80g.map((cert, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white rounded p-2">
                                <div>
                                  <p className="text-sm font-medium">{cert.certificate_number}</p>
                                  <p className="text-xs text-gray-500">{cert.issue_date} • FY {cert.financial_year}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-emerald-600">{formatCurrency(cert.amount)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No certificates issued yet</p>
                        )}
                      </div>

                      {/* Partnership Details */}
                      {partner.partnership && (
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <h4 className="font-semibold text-sm text-indigo-800 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Partnership Details
                          </h4>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <p><span className="text-gray-500">Status:</span> 
                              <Badge className={`ml-2 ${partner.partnership.partnership_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                {partner.partnership.partnership_status}
                              </Badge>
                            </p>
                            <p><span className="text-gray-500">Period:</span> {partner.partnership.start_date} to {partner.partnership.end_date}</p>
                            <p><span className="text-gray-500">Tier:</span> {partner.partnership.partnership_tier}</p>
                            <p><span className="text-gray-500">Admin Fee:</span> {partner.partnership.admin_fee_percent}%</p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                        <Button size="sm" className="flex-1 bg-emerald-600">
                          <FileText className="h-4 w-4 mr-2" />
                          Issue 80G
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CSRPartners;
