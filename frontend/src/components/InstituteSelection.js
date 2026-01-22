import React, { useState } from 'react';
import { 
  Building2, MapPin, Star, Trophy, CheckCircle, 
  Users, BookOpen, Home, Bus, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

const InstituteSelection = ({ institutes, onSelect, fundingAllocated }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleSelect = async (instituteId) => {
    setLoading(true);
    try {
      await api.put(`/student/select-institute/${instituteId}`);
      toast({
        title: "Institute Selected!",
        description: "Your institute has been selected successfully. Admin will process your enrollment.",
      });
      onSelect?.(instituteId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Selection Failed",
        description: error.response?.data?.detail || "Failed to select institute",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!institutes || institutes.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800">No institutes available at the moment.</p>
          <p className="text-sm text-amber-600 mt-1">Please contact admin for assistance.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="institute-selection">
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          <div>
            <h4 className="font-semibold text-amber-800">Action Required: Select Your Institute</h4>
            <p className="text-sm text-amber-700">
              Choose where you want to study. Your allocated budget: {formatCurrency(fundingAllocated)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {institutes.map((institute) => {
          const isWithinBudget = institute.fee_2_years <= (fundingAllocated || Infinity);
          const isSelected = selectedId === institute.institute_id;

          return (
            <Card 
              key={institute.institute_id}
              className={`transition-all cursor-pointer ${
                isSelected 
                  ? 'border-2 border-emerald-500 bg-emerald-50' 
                  : isWithinBudget 
                    ? 'border-gray-200 hover:border-indigo-300 hover:shadow-lg' 
                    : 'border-gray-200 opacity-60'
              }`}
              onClick={() => isWithinBudget && setSelectedId(institute.institute_id)}
              data-testid={`institute-card-${institute.institute_id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                      <h3 className="font-heading text-lg font-bold text-indigo-950">
                        {institute.name}
                      </h3>
                      {!isWithinBudget && (
                        <Badge className="bg-red-100 text-red-700">Exceeds Budget</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {institute.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        {institute.rating}/5
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-emerald-500" />
                        {institute.success_rate}% Success Rate
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {institute.features?.map((feature, idx) => (
                        <Badge key={idx} className="bg-indigo-100 text-indigo-700 text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {institute.is_hostel_available && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          <Home className="h-3 w-3 mr-1" />
                          Hostel Available
                        </Badge>
                      )}
                    </div>

                    {/* Coaching Types */}
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">
                        {institute.coaching_types?.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">2-Year Fee</p>
                    <p className={`text-2xl font-bold ${
                      isWithinBudget ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {formatCurrency(institute.fee_2_years)}
                    </p>
                    {isWithinBudget && fundingAllocated && (
                      <p className="text-xs text-gray-500 mt-1">
                        Remaining: {formatCurrency(fundingAllocated - institute.fee_2_years)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedId && (
        <div className="sticky bottom-4 bg-white rounded-lg shadow-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-indigo-950">
                Selected: {institutes.find(i => i.institute_id === selectedId)?.name}
              </p>
              <p className="text-sm text-gray-600">Click confirm to proceed with enrollment</p>
            </div>
            <Button
              onClick={() => handleSelect(selectedId)}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              data-testid="confirm-institute-btn"
            >
              {loading ? 'Processing...' : 'Confirm Selection'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteSelection;
