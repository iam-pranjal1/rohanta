import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Users, IndianRupee, Calendar, 
  CheckCircle, PauseCircle, XCircle, ChevronDown, ChevronUp, Gift
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';

const SponsorshipPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [expandedPackage, setExpandedPackage] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    package_name: '',
    total_amount: '',
    disbursement_type: 'monthly',
    payment_to: ['student'],
    benefits: {
      tuition: '',
      coaching: '',
      books: '',
      stipend: '',
      hostel: '',
      equipment: ''
    },
    eligibility: {
      min_score: 75,
      target_exam: ['JEE'],
      max_income: 300000
    },
    number_of_slots: 5,
    start_date: '',
    end_date: '',
    is_renewable: true,
    requirements: {
      monthly_progress: true,
      quarterly_review: true,
      final_result: true
    },
    description: ''
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get('/company/packages');
      setPackages(response.data.packages || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load packages" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clean up benefits - remove empty values
    const cleanBenefits = {};
    Object.entries(formData.benefits).forEach(([key, value]) => {
      if (value && parseFloat(value) > 0) {
        cleanBenefits[key] = parseFloat(value);
      }
    });

    const payload = {
      ...formData,
      total_amount: parseFloat(formData.total_amount),
      benefits: cleanBenefits,
      number_of_slots: parseInt(formData.number_of_slots)
    };

    try {
      if (editingPackage) {
        await api.put(`/company/packages/${editingPackage}`, payload);
        toast({ title: "Package updated!" });
      } else {
        await api.post('/company/packages', payload);
        toast({ title: "Package created!" });
      }
      setShowForm(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save package" });
    }
  };

  const updateStatus = async (packageId, status) => {
    try {
      await api.put(`/company/packages/${packageId}/status?status=${status}`);
      toast({ title: `Package ${status}` });
      fetchPackages();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    }
  };

  const resetForm = () => {
    setFormData({
      package_name: '',
      total_amount: '',
      disbursement_type: 'monthly',
      payment_to: ['student'],
      benefits: { tuition: '', coaching: '', books: '', stipend: '', hostel: '', equipment: '' },
      eligibility: { min_score: 75, target_exam: ['JEE'], max_income: 300000 },
      number_of_slots: 5,
      start_date: '',
      end_date: '',
      is_renewable: true,
      requirements: { monthly_progress: true, quarterly_review: true, final_result: true },
      description: ''
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      paused: { color: 'bg-yellow-100 text-yellow-700', icon: PauseCircle },
      closed: { color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const { color, icon: Icon } = config[status] || config.active;
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" /> {status}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-950">Sponsorship Packages</h2>
            <p className="text-sm text-gray-500">Create and manage your sponsorship offerings</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" /> Create Package
        </Button>
      </div>

      {/* Package List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading packages...</div>
      ) : packages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No packages yet</h3>
            <p className="text-gray-500 mb-4">Create your first sponsorship package to start helping students</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {packages.map(pkg => (
            <Card key={pkg.package_id} className="overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedPackage(expandedPackage === pkg.package_id ? null : pkg.package_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-indigo-950">{pkg.package_name}</h3>
                        {getStatusBadge(pkg.status)}
                      </div>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {formatCurrency(pkg.total_amount)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {pkg.slots_filled || 0}/{pkg.number_of_slots} slots filled
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {pkg.disbursement_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pkg.status === 'active' ? (
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateStatus(pkg.package_id, 'paused'); }}>
                        <PauseCircle className="h-4 w-4 mr-1" /> Pause
                      </Button>
                    ) : pkg.status === 'paused' ? (
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateStatus(pkg.package_id, 'active'); }}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Activate
                      </Button>
                    ) : null}
                    {expandedPackage === pkg.package_id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedPackage === pkg.package_id && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {/* Benefits */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Benefits Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(pkg.benefits || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm capitalize">{key}</span>
                          <span className="font-medium">{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Eligibility Criteria</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Min Score: {pkg.eligibility?.min_score}%</Badge>
                      {pkg.eligibility?.target_exam?.map(exam => (
                        <Badge key={exam} variant="outline">{exam}</Badge>
                      ))}
                      <Badge variant="outline">Max Income: {formatCurrency(pkg.eligibility?.max_income)}</Badge>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {pkg.requirements?.monthly_progress && <Badge className="bg-blue-100 text-blue-700">Monthly Progress</Badge>}
                      {pkg.requirements?.quarterly_review && <Badge className="bg-blue-100 text-blue-700">Quarterly Review</Badge>}
                      {pkg.requirements?.final_result && <Badge className="bg-blue-100 text-blue-700">Final Result</Badge>}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-4 text-sm">
                    <span><strong>Duration:</strong> {pkg.start_date} to {pkg.end_date}</span>
                    {pkg.is_renewable && <Badge className="bg-green-100 text-green-700">Renewable</Badge>}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(pkg.package_id, 'closed')}>
                      <XCircle className="h-4 w-4 mr-1" /> Close Package
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b bg-purple-50">
              <h3 className="text-lg font-semibold text-indigo-950">
                {editingPackage ? 'Edit Package' : 'Create Sponsorship Package'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Package Name</Label>
                  <Input
                    value={formData.package_name}
                    onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                    placeholder="e.g., Tech Excellence Scholarship 2026"
                    required
                  />
                </div>
                <div>
                  <Label>Total Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    placeholder="150000"
                    required
                  />
                </div>
                <div>
                  <Label>Number of Slots</Label>
                  <Input
                    type="number"
                    value={formData.number_of_slots}
                    onChange={(e) => setFormData({ ...formData, number_of_slots: e.target.value })}
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Disbursement */}
              <div>
                <Label className="mb-2 block">Disbursement Type</Label>
                <div className="flex gap-2">
                  {['monthly', 'quarterly', 'annual'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, disbursement_type: type })}
                      className={`px-4 py-2 rounded-lg border capitalize ${
                        formData.disbursement_type === type
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <Label className="mb-2 block">Benefits Breakdown (₹)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(formData.benefits).map(key => (
                    <div key={key}>
                      <Label className="text-xs capitalize text-gray-500">{key}</Label>
                      <Input
                        type="number"
                        value={formData.benefits[key]}
                        onChange={(e) => setFormData({
                          ...formData,
                          benefits: { ...formData.benefits, [key]: e.target.value }
                        })}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility */}
              <div>
                <Label className="mb-2 block">Eligibility Criteria</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Min Score (%)</Label>
                    <Input
                      type="number"
                      value={formData.eligibility.min_score}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, min_score: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Max Family Income (₹)</Label>
                    <Input
                      type="number"
                      value={formData.eligibility.max_income}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, max_income: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Target Exam</Label>
                    <select
                      value={formData.eligibility.target_exam[0]}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, target_exam: [e.target.value] }
                      })}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="JEE">JEE</option>
                      <option value="NEET">NEET</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <Label className="mb-2 block">Requirements</Label>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(formData.requirements).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          requirements: { ...formData.requirements, [key]: e.target.checked }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Renewable */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_renewable}
                  onChange={(e) => setFormData({ ...formData, is_renewable: e.target.checked })}
                  className="rounded"
                />
                <span>Renewable (based on performance)</span>
              </label>

              {/* Description */}
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your sponsorship package..."
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorshipPackages;
