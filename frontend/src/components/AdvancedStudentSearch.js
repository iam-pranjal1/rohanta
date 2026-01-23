import React, { useState } from 'react';
import { 
  Search, Filter, SlidersHorizontal, X, MapPin, GraduationCap, 
  IndianRupee, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';
import Avatar from './Avatar';

const AdvancedStudentSearch = ({ onSelectStudent }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    min_score: 60,
    max_score: 100,
    target_exams: [],
    states: [],
    school_types: [],
    min_income: null,
    max_income: null,
    gender: null,
    min_age: 14,
    max_age: 20,
    only_available: true
  });

  const targetExamOptions = ['IIT-JEE', 'NEET', 'JEE+NEET', 'Foundation'];
  const stateOptions = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal'];
  const schoolTypeOptions = ['Government', 'Private', 'Aided'];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/search/students?page=${page}&limit=10`, filters);
      setResults(response.data.students || []);
      setTotalResults(response.data.total || 0);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to search students" });
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const resetFilters = () => {
    setFilters({
      min_score: 60,
      max_score: 100,
      target_exams: [],
      states: [],
      school_types: [],
      min_income: null,
      max_income: null,
      gender: null,
      min_age: 14,
      max_age: 20,
      only_available: true
    });
    setResults([]);
  };

  const activeFilterCount = [
    filters.target_exams.length > 0,
    filters.states.length > 0,
    filters.school_types.length > 0,
    filters.gender !== null,
    filters.min_score !== 60 || filters.max_score !== 100,
    filters.min_age !== 14 || filters.max_age !== 20
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600" />
            Find Students
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="bg-indigo-100 text-indigo-700">{activeFilterCount}</Badge>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-6">
            {/* Academic Score Range */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-4 w-4" /> Academic Score (Class 10 %)
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Min:</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={filters.min_score}
                    onChange={(e) => setFilters({ ...filters, min_score: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ 
                      marginLeft: `${filters.min_score}%`,
                      width: `${filters.max_score - filters.min_score}%`
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Max:</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={filters.max_score}
                    onChange={(e) => setFilters({ ...filters, max_score: parseInt(e.target.value) || 100 })}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>

            {/* Target Exam */}
            <div>
              <Label className="mb-3 block">Target Exam</Label>
              <div className="flex flex-wrap gap-2">
                {targetExamOptions.map(exam => (
                  <button
                    key={exam}
                    onClick={() => toggleArrayFilter('target_exams', exam)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      filters.target_exams.includes(exam)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" /> Location (State)
              </Label>
              <div className="flex flex-wrap gap-2">
                {stateOptions.map(state => (
                  <button
                    key={state}
                    onClick={() => toggleArrayFilter('states', state)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      filters.states.includes(state)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            {/* School Type */}
            <div>
              <Label className="mb-3 block">School Type</Label>
              <div className="flex flex-wrap gap-2">
                {schoolTypeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleArrayFilter('school_types', type)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      filters.school_types.includes(type)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label className="mb-3 block">Gender</Label>
              <div className="flex gap-2">
                {['All', 'Male', 'Female'].map(g => (
                  <button
                    key={g}
                    onClick={() => setFilters({ ...filters, gender: g === 'All' ? null : g.toLowerCase() })}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                      (g === 'All' && !filters.gender) || filters.gender === g.toLowerCase()
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <Label className="mb-3 block">Age Range</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={10}
                  max={25}
                  value={filters.min_age}
                  onChange={(e) => setFilters({ ...filters, min_age: parseInt(e.target.value) || 14 })}
                  className="w-20"
                />
                <span>to</span>
                <Input
                  type="number"
                  min={10}
                  max={25}
                  value={filters.max_age}
                  onChange={(e) => setFilters({ ...filters, max_age: parseInt(e.target.value) || 20 })}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">years</span>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="only_available"
                checked={filters.only_available}
                onChange={(e) => setFilters({ ...filters, only_available: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="only_available">Show only available students (not yet sponsored)</Label>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" /> Reset Filters
              </Button>
              <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                <Search className="h-4 w-4 mr-2" /> Search Students
              </Button>
            </div>
          </div>
        )}

        {/* Quick Search Button (when filters hidden) */}
        {!showFilters && (
          <div className="flex justify-center mb-4">
            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
              <Search className="h-4 w-4 mr-2" /> Search with Current Filters
            </Button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Searching...</div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Found <strong>{totalResults}</strong> students matching your criteria
              </p>
            </div>

            <div className="grid gap-4">
              {results.map(student => (
                <div
                  key={student.student_id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectStudent?.(student)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={student.full_name} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-indigo-950">{student.full_name}</h3>
                          <p className="text-sm text-gray-600">{student.school_name}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          {student.class_10_percentage}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {student.coaching_details?.coaching_type && (
                          <Badge variant="outline">{student.coaching_details.coaching_type}</Badge>
                        )}
                        <Badge variant="outline" className="text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {student.address?.split(',').slice(-1)[0]?.trim() || 'Location N/A'}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm">View Profile</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Use the filters above to find students</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedStudentSearch;
