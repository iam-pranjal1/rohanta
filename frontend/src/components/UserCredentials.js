import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Search, Eye, EyeOff, Copy, Mail, Lock, Unlock,
  RefreshCw, ChevronLeft, ChevronRight, Shield, Clock, CheckCircle,
  XCircle, AlertTriangle, Key
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';
import Avatar from './Avatar';

const UserCredentials = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, [activeTab, search, statusFilter, page]);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 10);

      if (activeTab === 'students') {
        const response = await api.get(`/admin/credentials/students?${params.toString()}`);
        setStudents(response.data.students || []);
        setTotalPages(response.data.total_pages || 1);
      } else {
        const response = await api.get(`/admin/credentials/companies?${params.toString()}`);
        setCompanies(response.data.companies || []);
        setTotalPages(response.data.total_pages || 1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleResetPassword = async () => {
    if (!resetPasswordModal || !newPassword) return;
    
    try {
      const endpoint = resetPasswordModal.type === 'student' 
        ? `/admin/credentials/student/${resetPasswordModal.id}/reset-password`
        : `/admin/credentials/company/${resetPasswordModal.id}/reset-password`;
      
      await api.post(endpoint, { new_password: newPassword });
      
      toast({
        title: "Password Reset",
        description: "Password has been reset successfully",
      });
      
      setResetPasswordModal(null);
      setNewPassword('');
      fetchCredentials();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset password",
      });
    }
  };

  const handleLockAccount = async (userId, userType, isLocked) => {
    try {
      const endpoint = userType === 'student'
        ? `/admin/credentials/student/${userId}/lock`
        : `/admin/credentials/company/${userId}/lock`;
      
      await api.patch(endpoint, { is_locked: !isLocked });
      
      toast({
        title: isLocked ? "Account Unlocked" : "Account Locked",
        description: `Account has been ${isLocked ? 'unlocked' : 'locked'} successfully`,
      });
      
      fetchCredentials();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update account status",
      });
    }
  };

  const handleSendCredentialsEmail = async (userId, userType) => {
    try {
      const endpoint = userType === 'student'
        ? `/admin/credentials/student/${userId}/send-email`
        : `/admin/credentials/company/${userId}/send-email`;
      
      await api.post(endpoint, { include_password: true });
      
      toast({
        title: "Email Sent",
        description: "Credentials email has been sent successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.detail || "Failed to send email",
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const UserCard = ({ user, type }) => {
    const userId = type === 'student' ? user.student_id : user.company_id;
    const name = type === 'student' ? user.full_name : user.company_name;
    const isPasswordVisible = visiblePasswords[userId];
    const isLocked = user.is_locked;

    return (
      <Card className={`mb-3 ${isLocked ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={name} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-indigo-950">{name}</h3>
                  {isLocked && (
                    <Badge className="bg-red-100 text-red-800">
                      <Lock className="h-3 w-3 mr-1" /> Locked
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  {type === 'student' && getStatusBadge(user.verification_status)}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last login: {formatDate(user.last_login)}
                  </span>
                  <span>Logins: {user.login_count || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedUser({ ...user, type });
                  setShowModal(true);
                }}
                data-testid={`view-${userId}`}
              >
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
            </div>
          </div>

          {/* Credentials Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded border flex-1 truncate">
                    {user.email}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(user.email, 'Email')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Password</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded border flex-1">
                    {isPasswordVisible ? (user.password_plain || '••••••••') : '••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePasswordVisibility(userId)}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {isPasswordVisible && user.password_plain && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(user.password_plain, 'Password')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setResetPasswordModal({ id: userId, type, name })}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Reset Password
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendCredentialsEmail(userId, type)}
              >
                <Mail className="h-4 w-4 mr-1" /> Send Email
              </Button>
              <Button
                size="sm"
                variant={isLocked ? "default" : "outline"}
                className={isLocked ? "bg-green-600 hover:bg-green-700" : "text-red-600 border-red-200 hover:bg-red-50"}
                onClick={() => handleLockAccount(userId, type, isLocked)}
              >
                {isLocked ? (
                  <><Unlock className="h-4 w-4 mr-1" /> Unlock</>
                ) : (
                  <><Lock className="h-4 w-4 mr-1" /> Lock</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-950">User Credentials</h2>
            <p className="text-sm text-gray-500">Manage login credentials for students and companies</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList className="bg-white border">
          <TabsTrigger 
            value="students" 
            className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white"
            data-testid="credentials-students-tab"
          >
            <Users className="h-4 w-4 mr-2" />
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger 
            value="companies" 
            className="data-[state=active]:bg-indigo-950 data-[state=active]:text-white"
            data-testid="credentials-companies-tab"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Companies ({companies.length})
          </TabsTrigger>
        </TabsList>

        {/* Search & Filter */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search by name, email, phone...`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
              data-testid="credentials-search"
            />
          </div>
          {activeTab === 'students' && (
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border rounded-md px-3 py-2 text-sm"
              data-testid="credentials-status-filter"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>

        {/* Content */}
        <TabsContent value="students" className="mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No students found</div>
          ) : (
            students.map(student => (
              <UserCard key={student.student_id} user={student} type="student" />
            ))
          )}
        </TabsContent>

        <TabsContent value="companies" className="mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No companies found</div>
          ) : (
            companies.map(company => (
              <UserCard key={company.company_id} user={company} type="company" />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b bg-gradient-to-r from-indigo-950 to-indigo-800">
              <div className="flex items-center gap-4">
                <Avatar name={selectedUser.type === 'student' ? selectedUser.full_name : selectedUser.company_name} size="lg" />
                <div className="text-white">
                  <h3 className="text-xl font-bold">
                    {selectedUser.type === 'student' ? selectedUser.full_name : selectedUser.company_name}
                  </h3>
                  <p className="text-indigo-200 text-sm capitalize">{selectedUser.type} Account</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div>
                <h4 className="font-semibold text-indigo-950 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> User Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-gray-500">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Phone</label>
                    <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  {selectedUser.type === 'student' && (
                    <>
                      <div>
                        <label className="text-gray-500">School</label>
                        <p className="font-medium">{selectedUser.school_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">Status</label>
                        <p>{getStatusBadge(selectedUser.verification_status)}</p>
                      </div>
                    </>
                  )}
                  {selectedUser.type === 'company' && (
                    <>
                      <div>
                        <label className="text-gray-500">Contact Person</label>
                        <p className="font-medium">{selectedUser.contact_person || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">Industry</label>
                        <p className="font-medium">{selectedUser.industry || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Login Credentials */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-indigo-950 mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4" /> Login Credentials
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                        {selectedUser.email}
                      </code>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedUser.email, 'Email')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Password</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                        {visiblePasswords[selectedUser.type === 'student' ? selectedUser.student_id : selectedUser.company_id] 
                          ? (selectedUser.password_plain || 'Not available')
                          : '••••••••••••'}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => togglePasswordVisibility(selectedUser.type === 'student' ? selectedUser.student_id : selectedUser.company_id)}
                      >
                        {visiblePasswords[selectedUser.type === 'student' ? selectedUser.student_id : selectedUser.company_id] 
                          ? <EyeOff className="h-4 w-4" /> 
                          : <Eye className="h-4 w-4" />}
                      </Button>
                      {visiblePasswords[selectedUser.type === 'student' ? selectedUser.student_id : selectedUser.company_id] && selectedUser.password_plain && (
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedUser.password_plain, 'Password')}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {!selectedUser.password_plain && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Password was set before credential tracking was enabled
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div>
                <h4 className="font-semibold text-indigo-950 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Account Activity
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-gray-500">Created On</label>
                    <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Last Login</label>
                    <p className="font-medium">{formatDate(selectedUser.last_login)}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Login Count</label>
                    <p className="font-medium">{selectedUser.login_count || 0} times</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Account Status</label>
                    <p className="font-medium">
                      {selectedUser.is_locked ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <Lock className="h-4 w-4" /> Locked
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Active
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const userId = selectedUser.type === 'student' ? selectedUser.student_id : selectedUser.company_id;
                    setResetPasswordModal({ 
                      id: userId, 
                      type: selectedUser.type, 
                      name: selectedUser.type === 'student' ? selectedUser.full_name : selectedUser.company_name 
                    });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const userId = selectedUser.type === 'student' ? selectedUser.student_id : selectedUser.company_id;
                    handleSendCredentialsEmail(userId, selectedUser.type);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" /> Send Credentials Email
                </Button>
                <Button
                  variant={selectedUser.is_locked ? "default" : "outline"}
                  className={selectedUser.is_locked ? "bg-green-600 hover:bg-green-700" : "text-red-600"}
                  onClick={() => {
                    const userId = selectedUser.type === 'student' ? selectedUser.student_id : selectedUser.company_id;
                    handleLockAccount(userId, selectedUser.type, selectedUser.is_locked);
                    setShowModal(false);
                  }}
                >
                  {selectedUser.is_locked ? (
                    <><Unlock className="h-4 w-4 mr-2" /> Unlock Account</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" /> Lock Account</>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setResetPasswordModal(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-indigo-950">Reset Password</h3>
              <p className="text-sm text-gray-500">Set a new password for {resetPasswordModal.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    data-testid="new-password-input"
                  />
                  <Button variant="outline" onClick={generatePassword}>
                    Generate
                  </Button>
                </div>
              </div>
              
              {newPassword && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>New Password:</strong> {newPassword}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => copyToClipboard(newPassword, 'New password')}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setResetPasswordModal(null); setNewPassword(''); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleResetPassword}
                disabled={!newPassword}
                className="bg-indigo-950 hover:bg-indigo-800"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCredentials;
