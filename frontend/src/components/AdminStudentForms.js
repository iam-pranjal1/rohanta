import React, { useState } from 'react';
import { 
  GraduationCap, DollarSign, BookOpen, Trophy, Plus, X,
  Calendar, MapPin, Target, Save, AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import api from '../utils/api';
import { useToast } from '../hooks/use-toast';

const COACHING_TYPES = ['IIT-JEE', 'NEET', 'JEE+NEET', 'Foundation'];
const PAYMENT_SCHEDULES = ['Monthly', 'Quarterly', 'Semester', 'Annual'];
const EXAM_TYPES = ['JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'MOCK_TEST'];
const ADMISSION_STATUSES = ['Admitted', 'Waitlisted', 'Not Admitted', 'Pending'];

const AdminStudentForms = ({ student, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('coaching');

  // Coaching Form State
  const [coachingForm, setCoachingForm] = useState({
    institute_name: student?.coaching_details?.institute_name || '',
    institute_location: student?.coaching_details?.institute_location || '',
    coaching_type: student?.coaching_details?.coaching_type || 'IIT-JEE',
    course_duration: student?.coaching_details?.course_duration || '',
    batch_year: student?.coaching_details?.batch_year || '',
    enrollment_date: student?.coaching_details?.enrollment_date || '',
    expected_exam_date: student?.coaching_details?.expected_exam_date || ''
  });

  // Funding Form State
  const [fundingForm, setFundingForm] = useState({
    total_amount_allocated: student?.funding_details?.total_amount_allocated || 0,
    amount_per_year: student?.funding_details?.amount_per_year || 0,
    amount_utilized: student?.funding_details?.amount_utilized || 0,
    payment_schedule: student?.funding_details?.payment_schedule || 'Quarterly',
    sponsored_items: student?.funding_details?.sponsored_items || [],
    funding_breakdown: student?.funding_details?.funding_breakdown || {
      tuition_fees: 0,
      study_material: 0,
      test_series: 0,
      hostel_food: 0,
      transport: 0,
      other: 0
    }
  });
  const [newSponsoredItem, setNewSponsoredItem] = useState('');

  // Mock Test Form State
  const [mockTestForm, setMockTestForm] = useState({
    exam_name: '',
    test_date: '',
    total_marks: 300,
    obtained_marks: 0,
    rank: '',
    percentile: '',
    subject_breakdown: {
      physics: '',
      chemistry: '',
      mathematics: '',
      biology: ''
    }
  });

  // Actual Exam Form State
  const [actualExamForm, setActualExamForm] = useState({
    exam_name: '',
    exam_type: 'JEE_MAIN',
    exam_date: '',
    total_marks: 300,
    obtained_marks: 0,
    rank: '',
    state_rank: '',
    category_rank: '',
    percentile: '',
    qualified: false,
    cutoff_crossed: false,
    subject_scores: {
      physics: '',
      chemistry: '',
      mathematics: '',
      biology: ''
    }
  });

  // Final Result Form State
  const [finalResultForm, setFinalResultForm] = useState({
    exam_cleared: student?.exam_performance?.final_result?.exam_cleared || false,
    exam_name: student?.exam_performance?.final_result?.exam_name || '',
    final_rank: student?.exam_performance?.final_result?.final_rank || '',
    college_allotted: student?.exam_performance?.final_result?.college_allotted || '',
    branch_course: student?.exam_performance?.final_result?.branch_course || '',
    admission_status: student?.exam_performance?.final_result?.admission_status || 'Pending',
    achievement_date: student?.exam_performance?.final_result?.achievement_date || ''
  });

  // Handlers
  const handleSaveCoaching = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/student/coaching/${student.student_id}`, coachingForm);
      toast({ title: 'Success', description: 'Coaching details updated successfully' });
      onUpdate?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.detail || 'Failed to update' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFunding = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/student/funding/${student.student_id}`, fundingForm);
      toast({ title: 'Success', description: 'Funding details updated successfully' });
      onUpdate?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.detail || 'Failed to update' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMockTest = async () => {
    setLoading(true);
    try {
      const data = {
        ...mockTestForm,
        rank: mockTestForm.rank ? parseInt(mockTestForm.rank) : null,
        percentile: mockTestForm.percentile ? parseFloat(mockTestForm.percentile) : null,
        subject_breakdown: {
          physics: mockTestForm.subject_breakdown.physics ? parseFloat(mockTestForm.subject_breakdown.physics) : null,
          chemistry: mockTestForm.subject_breakdown.chemistry ? parseFloat(mockTestForm.subject_breakdown.chemistry) : null,
          mathematics: mockTestForm.subject_breakdown.mathematics ? parseFloat(mockTestForm.subject_breakdown.mathematics) : null,
          biology: mockTestForm.subject_breakdown.biology ? parseFloat(mockTestForm.subject_breakdown.biology) : null
        }
      };
      await api.post(`/admin/student/mock-test/${student.student_id}`, data);
      toast({ title: 'Success', description: 'Mock test added successfully' });
      // Reset form
      setMockTestForm({
        exam_name: '',
        test_date: '',
        total_marks: 300,
        obtained_marks: 0,
        rank: '',
        percentile: '',
        subject_breakdown: { physics: '', chemistry: '', mathematics: '', biology: '' }
      });
      onUpdate?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.detail || 'Failed to add' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActualExam = async () => {
    setLoading(true);
    try {
      const data = {
        ...actualExamForm,
        rank: actualExamForm.rank ? parseInt(actualExamForm.rank) : null,
        state_rank: actualExamForm.state_rank ? parseInt(actualExamForm.state_rank) : null,
        category_rank: actualExamForm.category_rank ? parseInt(actualExamForm.category_rank) : null,
        percentile: actualExamForm.percentile ? parseFloat(actualExamForm.percentile) : null,
        subject_scores: {
          physics: actualExamForm.subject_scores.physics ? parseFloat(actualExamForm.subject_scores.physics) : null,
          chemistry: actualExamForm.subject_scores.chemistry ? parseFloat(actualExamForm.subject_scores.chemistry) : null,
          mathematics: actualExamForm.subject_scores.mathematics ? parseFloat(actualExamForm.subject_scores.mathematics) : null,
          biology: actualExamForm.subject_scores.biology ? parseFloat(actualExamForm.subject_scores.biology) : null
        }
      };
      await api.post(`/admin/student/actual-exam/${student.student_id}`, data);
      toast({ title: 'Success', description: 'Actual exam result added successfully' });
      // Reset form
      setActualExamForm({
        exam_name: '',
        exam_type: 'JEE_MAIN',
        exam_date: '',
        total_marks: 300,
        obtained_marks: 0,
        rank: '',
        state_rank: '',
        category_rank: '',
        percentile: '',
        qualified: false,
        cutoff_crossed: false,
        subject_scores: { physics: '', chemistry: '', mathematics: '', biology: '' }
      });
      onUpdate?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.detail || 'Failed to add' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFinalResult = async () => {
    setLoading(true);
    try {
      const data = {
        ...finalResultForm,
        final_rank: finalResultForm.final_rank ? parseInt(finalResultForm.final_rank) : null
      };
      await api.put(`/admin/student/final-result/${student.student_id}`, data);
      toast({ title: 'Success', description: 'Final result updated successfully' });
      onUpdate?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.detail || 'Failed to update' });
    } finally {
      setLoading(false);
    }
  };

  const addSponsoredItem = () => {
    if (newSponsoredItem.trim()) {
      setFundingForm(prev => ({
        ...prev,
        sponsored_items: [...prev.sponsored_items, newSponsoredItem.trim()]
      }));
      setNewSponsoredItem('');
    }
  };

  const removeSponsoredItem = (index) => {
    setFundingForm(prev => ({
      ...prev,
      sponsored_items: prev.sponsored_items.filter((_, i) => i !== index)
    }));
  };

  if (!student) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          Select a student to manage their details
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-100" data-testid="admin-student-forms">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          Manage: {student.full_name}
        </CardTitle>
        <CardDescription>Update coaching, funding, and exam details</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="coaching" className="text-xs">
              <Target className="h-4 w-4 mr-1" />
              Coaching
            </TabsTrigger>
            <TabsTrigger value="funding" className="text-xs">
              <DollarSign className="h-4 w-4 mr-1" />
              Funding
            </TabsTrigger>
            <TabsTrigger value="mock" className="text-xs">
              <BookOpen className="h-4 w-4 mr-1" />
              Mock Test
            </TabsTrigger>
            <TabsTrigger value="actual" className="text-xs">
              <Calendar className="h-4 w-4 mr-1" />
              Actual Exam
            </TabsTrigger>
            <TabsTrigger value="final" className="text-xs">
              <Trophy className="h-4 w-4 mr-1" />
              Final Result
            </TabsTrigger>
          </TabsList>

          {/* Coaching Tab */}
          <TabsContent value="coaching" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Institute Name</Label>
                <Input
                  value={coachingForm.institute_name}
                  onChange={(e) => setCoachingForm(prev => ({ ...prev, institute_name: e.target.value }))}
                  placeholder="e.g., Allen Career Institute"
                  data-testid="coaching-institute-name"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={coachingForm.institute_location}
                  onChange={(e) => setCoachingForm(prev => ({ ...prev, institute_location: e.target.value }))}
                  placeholder="e.g., Kota, Rajasthan"
                  data-testid="coaching-location"
                />
              </div>
              <div>
                <Label>Coaching Type</Label>
                <select
                  value={coachingForm.coaching_type}
                  onChange={(e) => setCoachingForm(prev => ({ ...prev, coaching_type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  data-testid="coaching-type"
                >
                  {COACHING_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Course Duration</Label>
                <Input
                  value={coachingForm.course_duration}
                  onChange={(e) => setCoachingForm(prev => ({ ...prev, course_duration: e.target.value }))}
                  placeholder="e.g., 2 Years (11th-12th)"
                  data-testid="coaching-duration"
                />
              </div>
              <div>
                <Label>Batch Year</Label>
                <Input
                  value={coachingForm.batch_year}
                  onChange={(e) => setCoachingForm(prev => ({ ...prev, batch_year: e.target.value }))}
                  placeholder="e.g., 2024-2026"
                  data-testid="coaching-batch"
                />
              </div>
              <div>
                <Label>Enrollment Date</Label>
                <Input
                  type="date"
                  value={coachingForm.enrollment_date}
                  onChange={(e) => setCoachingForm(prev => ({ ...prev, enrollment_date: e.target.value }))}
                  data-testid="coaching-enrollment"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Expected Exam Date</Label>
                <Input
                  value={coachingForm.expected_exam_date}
                  onChange={(e) => setCoachingForm(prev => ({ ...prev, expected_exam_date: e.target.value }))}
                  placeholder="e.g., JEE Advanced 2026 (May 2026)"
                  data-testid="coaching-expected-exam"
                />
              </div>
            </div>
            <Button onClick={handleSaveCoaching} disabled={loading} className="w-full bg-indigo-950" data-testid="save-coaching-btn">
              <Save className="h-4 w-4 mr-2" />
              Save Coaching Details
            </Button>
          </TabsContent>

          {/* Funding Tab */}
          <TabsContent value="funding" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Total Amount Allocated (₹)</Label>
                <Input
                  type="number"
                  value={fundingForm.total_amount_allocated}
                  onChange={(e) => setFundingForm(prev => ({ ...prev, total_amount_allocated: parseFloat(e.target.value) || 0 }))}
                  data-testid="funding-total"
                />
              </div>
              <div>
                <Label>Amount Per Year (₹)</Label>
                <Input
                  type="number"
                  value={fundingForm.amount_per_year}
                  onChange={(e) => setFundingForm(prev => ({ ...prev, amount_per_year: parseFloat(e.target.value) || 0 }))}
                  data-testid="funding-per-year"
                />
              </div>
              <div>
                <Label>Amount Utilized (₹)</Label>
                <Input
                  type="number"
                  value={fundingForm.amount_utilized}
                  onChange={(e) => setFundingForm(prev => ({ ...prev, amount_utilized: parseFloat(e.target.value) || 0 }))}
                  data-testid="funding-utilized"
                />
              </div>
            </div>

            <div>
              <Label>Payment Schedule</Label>
              <select
                value={fundingForm.payment_schedule}
                onChange={(e) => setFundingForm(prev => ({ ...prev, payment_schedule: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                data-testid="funding-schedule"
              >
                {PAYMENT_SCHEDULES.map(schedule => (
                  <option key={schedule} value={schedule}>{schedule}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Sponsored Items</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newSponsoredItem}
                  onChange={(e) => setNewSponsoredItem(e.target.value)}
                  placeholder="e.g., Tuition Fee, Books, Hostel"
                  onKeyPress={(e) => e.key === 'Enter' && addSponsoredItem()}
                />
                <Button type="button" onClick={addSponsoredItem} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {fundingForm.sponsored_items.map((item, idx) => (
                  <Badge key={idx} className="bg-amber-100 text-amber-800">
                    {item}
                    <button onClick={() => removeSponsoredItem(idx)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Funding Breakdown (₹)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(fundingForm.funding_breakdown).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-xs capitalize">{key.replace('_', ' ')}</Label>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setFundingForm(prev => ({
                        ...prev,
                        funding_breakdown: {
                          ...prev.funding_breakdown,
                          [key]: parseFloat(e.target.value) || 0
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSaveFunding} disabled={loading} className="w-full bg-emerald-600" data-testid="save-funding-btn">
              <Save className="h-4 w-4 mr-2" />
              Save Funding Details
            </Button>
          </TabsContent>

          {/* Mock Test Tab */}
          <TabsContent value="mock" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Exam Name</Label>
                <Input
                  value={mockTestForm.exam_name}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, exam_name: e.target.value }))}
                  placeholder="e.g., JEE Main Mock Test 5"
                  data-testid="mock-exam-name"
                />
              </div>
              <div>
                <Label>Test Date</Label>
                <Input
                  type="date"
                  value={mockTestForm.test_date}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, test_date: e.target.value }))}
                  data-testid="mock-test-date"
                />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  value={mockTestForm.total_marks}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, total_marks: parseFloat(e.target.value) || 0 }))}
                  data-testid="mock-total-marks"
                />
              </div>
              <div>
                <Label>Obtained Marks</Label>
                <Input
                  type="number"
                  value={mockTestForm.obtained_marks}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, obtained_marks: parseFloat(e.target.value) || 0 }))}
                  data-testid="mock-obtained-marks"
                />
              </div>
              <div>
                <Label>Rank</Label>
                <Input
                  type="number"
                  value={mockTestForm.rank}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, rank: e.target.value }))}
                  placeholder="Optional"
                  data-testid="mock-rank"
                />
              </div>
              <div>
                <Label>Percentile</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={mockTestForm.percentile}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, percentile: e.target.value }))}
                  placeholder="Optional"
                  data-testid="mock-percentile"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Subject Breakdown (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(mockTestForm.subject_breakdown).map(([subject, score]) => (
                  <div key={subject}>
                    <Label className="text-xs capitalize">{subject}</Label>
                    <Input
                      type="number"
                      value={score}
                      onChange={(e) => setMockTestForm(prev => ({
                        ...prev,
                        subject_breakdown: { ...prev.subject_breakdown, [subject]: e.target.value }
                      }))}
                      placeholder="Score"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleAddMockTest} disabled={loading} className="w-full bg-purple-600" data-testid="add-mock-test-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Mock Test Result
            </Button>
          </TabsContent>

          {/* Actual Exam Tab */}
          <TabsContent value="actual" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Exam Name</Label>
                <Input
                  value={actualExamForm.exam_name}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, exam_name: e.target.value }))}
                  placeholder="e.g., JEE Main 2026 - Session 1"
                  data-testid="actual-exam-name"
                />
              </div>
              <div>
                <Label>Exam Type</Label>
                <select
                  value={actualExamForm.exam_type}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, exam_type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  data-testid="actual-exam-type"
                >
                  {EXAM_TYPES.filter(t => t !== 'MOCK_TEST').map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Exam Date</Label>
                <Input
                  type="date"
                  value={actualExamForm.exam_date}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, exam_date: e.target.value }))}
                  data-testid="actual-exam-date"
                />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  value={actualExamForm.total_marks}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, total_marks: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Obtained Marks</Label>
                <Input
                  type="number"
                  value={actualExamForm.obtained_marks}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, obtained_marks: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>AIR (All India Rank)</Label>
                <Input
                  type="number"
                  value={actualExamForm.rank}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, rank: e.target.value }))}
                />
              </div>
              <div>
                <Label>State Rank</Label>
                <Input
                  type="number"
                  value={actualExamForm.state_rank}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, state_rank: e.target.value }))}
                />
              </div>
              <div>
                <Label>Category Rank</Label>
                <Input
                  type="number"
                  value={actualExamForm.category_rank}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, category_rank: e.target.value }))}
                />
              </div>
              <div>
                <Label>Percentile</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={actualExamForm.percentile}
                  onChange={(e) => setActualExamForm(prev => ({ ...prev, percentile: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actualExamForm.qualified}
                    onChange={(e) => setActualExamForm(prev => ({ ...prev, qualified: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Qualified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actualExamForm.cutoff_crossed}
                    onChange={(e) => setActualExamForm(prev => ({ ...prev, cutoff_crossed: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Cutoff Crossed</span>
                </label>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Subject Scores (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(actualExamForm.subject_scores).map(([subject, score]) => (
                  <div key={subject}>
                    <Label className="text-xs capitalize">{subject}</Label>
                    <Input
                      type="number"
                      value={score}
                      onChange={(e) => setActualExamForm(prev => ({
                        ...prev,
                        subject_scores: { ...prev.subject_scores, [subject]: e.target.value }
                      }))}
                      placeholder="Score"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleAddActualExam} disabled={loading} className="w-full bg-amber-600" data-testid="add-actual-exam-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Actual Exam Result
            </Button>
          </TabsContent>

          {/* Final Result Tab */}
          <TabsContent value="final" className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalResultForm.exam_cleared}
                  onChange={(e) => setFinalResultForm(prev => ({ ...prev, exam_cleared: e.target.checked }))}
                  className="w-5 h-5"
                  data-testid="final-exam-cleared"
                />
                <span className="font-semibold text-emerald-800">Student has cleared the exam!</span>
              </label>
            </div>

            {finalResultForm.exam_cleared && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Exam Name</Label>
                  <Input
                    value={finalResultForm.exam_name}
                    onChange={(e) => setFinalResultForm(prev => ({ ...prev, exam_name: e.target.value }))}
                    placeholder="e.g., JEE Advanced 2026"
                    data-testid="final-exam-name"
                  />
                </div>
                <div>
                  <Label>Final AIR</Label>
                  <Input
                    type="number"
                    value={finalResultForm.final_rank}
                    onChange={(e) => setFinalResultForm(prev => ({ ...prev, final_rank: e.target.value }))}
                    placeholder="All India Rank"
                    data-testid="final-air"
                  />
                </div>
                <div>
                  <Label>College Allotted</Label>
                  <Input
                    value={finalResultForm.college_allotted}
                    onChange={(e) => setFinalResultForm(prev => ({ ...prev, college_allotted: e.target.value }))}
                    placeholder="e.g., IIT Delhi"
                    data-testid="final-college"
                  />
                </div>
                <div>
                  <Label>Branch/Course</Label>
                  <Input
                    value={finalResultForm.branch_course}
                    onChange={(e) => setFinalResultForm(prev => ({ ...prev, branch_course: e.target.value }))}
                    placeholder="e.g., Computer Science"
                    data-testid="final-branch"
                  />
                </div>
                <div>
                  <Label>Admission Status</Label>
                  <select
                    value={finalResultForm.admission_status}
                    onChange={(e) => setFinalResultForm(prev => ({ ...prev, admission_status: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    data-testid="final-admission-status"
                  >
                    {ADMISSION_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Achievement Date</Label>
                  <Input
                    type="date"
                    value={finalResultForm.achievement_date}
                    onChange={(e) => setFinalResultForm(prev => ({ ...prev, achievement_date: e.target.value }))}
                    data-testid="final-achievement-date"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleSaveFinalResult} disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600" data-testid="save-final-result-btn">
              <Trophy className="h-4 w-4 mr-2" />
              Save Final Result
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminStudentForms;
