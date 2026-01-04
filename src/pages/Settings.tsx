import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings as SettingsIcon, Shield, Calendar, Trash2, Mail } from 'lucide-react';
import { AuthService } from '../services/auth';
import { UserManagementService } from '../services/userManagement.ts';
import { useAuthStore } from '../store';
import type { User } from '../types';
import toast from 'react-hot-toast';
import { Button, LoadingSpinner } from '../components/ui';

interface UserFormData {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'staff';
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    displayName: '',
    role: 'staff'
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  
  const { user: currentUser } = useAuthStore();
  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      loadUsers();
    }
  }, [activeTab, isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await UserManagementService.getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};
    
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (!formData.displayName) errors.displayName = 'Full name is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await AuthService.signUp(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role
      );
      
      if (result.success) {
        toast.success('User created successfully');
        setFormData({ email: '', password: '', displayName: '', role: 'staff' });
        setShowUserForm(false);
        loadUsers(); // Refresh user list
      } else {
        toast.error(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"?`)) return;
    
    setLoading(true);
    try {
      const result = await UserManagementService.deleteUser(userId);
      if (result.success) {
        toast.success('User deleted successfully');
        loadUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: SettingsIcon },
    ...(isAdmin ? [{ id: 'users', label: 'User Management', icon: Users }] : [])
  ];

  return (
    <>
      {/* Content */}
      <div className="w-full space-y-6 lg:space-y-8 px-6 lg:px-8 py-6 lg:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-left">Settings</h1>
          <p className="text-gray-600 text-left">Manage your application settings and configuration</p>
        </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
        <nav className="flex space-x-6 lg:space-x-8 px-4 lg:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'general' | 'users')}
              className={`py-3 lg:py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="grid gap-6">
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <SettingsIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold">Application Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  defaultValue="Techo Lanka (Pvt) Ltd"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <input
                  type="email"
                  className="input-field mt-1"
                  placeholder="company@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  defaultValue="18"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              
              <div className="pt-4">
                <Button variant="primary">Save Settings</Button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{currentUser?.displayName || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{currentUser?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    currentUser?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Staff'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Tab (Admin Only) */}
      {activeTab === 'users' && isAdmin && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-gray-600">Manage system users and their permissions</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowUserForm(!showUserForm)}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add New User</span>
            </Button>
          </div>

          {/* Add User Form */}
          {showUserForm && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    className={`input-field mt-1 ${formErrors.displayName ? 'border-red-300' : ''}`}
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter full name"
                  />
                  {formErrors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.displayName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    className={`input-field mt-1 ${formErrors.email ? 'border-red-300' : ''}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    className={`input-field mt-1 ${formErrors.password ? 'border-red-300' : ''}`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    className="input-field mt-1"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' })}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create User</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUserForm(false);
                      setFormData({ email: '', password: '', displayName: '', role: 'staff' });
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Users List */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Current Users</h3>
            
            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            )}

            {!loading && (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Shield className={`h-5 w-5 ${user.role === 'admin' ? 'text-purple-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{user.displayName || 'No name'}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Staff'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {user.createdAt.toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentUser?.uid !== user.uid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.uid, user.email)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {users.length === 0 && !loading && (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-admin message for users tab */}
      {activeTab === 'users' && !isAdmin && (
        <div className="card text-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Administrator Access Required</h3>
          <p className="text-gray-500">You need administrator privileges to manage users.</p>
        </div>
      )}
      </div>
    </>
  );
};
