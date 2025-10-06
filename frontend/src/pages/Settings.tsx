import React, { useState, useEffect } from 'react';
import { Users, Shield, MapPin, Building2, UserCheck, Search, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Button } from '../components/ui/Button';

interface AdminUser {
  id?: string;
  _id?: string;
  fullName?: string;
  email?: string;
  role?: string;
  restaurant?: string | string[]; // frontend property
  restaurantID?: string[]; // backend property
  phone?: string;
  password?: string;
  superadminsID?: string[];
  ownerID?: string[];
  districtmanagerID?: string[];
  generalmanagerID?: string[];
}

const AccessController = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    role: 'owner',
    restaurant: '',
    phone: '',
    password: '',
    superadminsID: [] as string[],
    ownerID: [] as string[],
    districtmanagerID: [] as string[],
    generalmanagerID: [] as string[],
    restaurantIDs: [] as string[],
  });
  const [currentUserRole] = useState('super_admin'); // Simulate logged-in user role

  // Remove Employee from this page; this page is not for employees
  const roles = [
    { value: 'superadmin', label: 'Super Admin', icon: Shield, color: 'text-red-600' },
    { value: 'owner', label: 'Owner', icon: Building2, color: 'text-blue-600' },
    { value: 'districtmanager', label: 'District Manager', icon: MapPin, color: 'text-green-600' },
    { value: 'generalmanager', label: 'General Manager', icon: UserCheck, color: 'text-yellow-600' }
  ];

  // Restaurants from Context API
  const { restaurants } = useDashboard();

  // helpers
  // Used for client-side identity (fallback to email to avoid empty id matching all)
  const getUserId = (u: AdminUser) => String(u.id || u._id || u.email || '');
  // Used for backend payloads (must be a real DB id if available)
  const getPrimaryId = (u: AdminUser) => String(u._id || u.id || '');
  const nameToGmail = (name?: string) => {
    if (!name) return '';
    const slug = name.toLowerCase().replace(/\s+/g, '.');
    return `${slug}@gmail.com`;
  };

  // validation for Add User (all fields required, must select at least one restaurant)
  const isAddFormValid =
    (newUser.fullName || '').trim().length > 0 &&
    (newUser.phone || '').trim().length > 0 &&
    (newUser.password || '').trim().length > 0 &&
    (newUser.role || '').trim().length > 0 &&
    // newUser.restaurantIDs.length > 0 &&
    ((newUser.superadminsID?.length || 0) >= 0) && // not required but defined
    ((newUser.ownerID?.length || 0) >= 0) &&
    ((newUser.districtmanagerID?.length || 0) >= 0) &&
    ((newUser.generalmanagerID?.length || 0) >= 0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/auth/admins`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      // Map restaurantID to restaurant for frontend compatibility
      const adminsWithMappedRestaurants = (data.admins || []).map((admin: { restaurantID: any; restaurant: any; }) => ({
        ...admin,
        restaurant: admin.restaurantID || admin.restaurant || []
      }));

      setUsers(adminsWithMappedRestaurants);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (roleValue: string) => {
    return roles.find(role => role.value === roleValue) || roles[0];
  };

  const getRolePermissions = (role: string | undefined | null) => {
    const permissions: Record<string, string[]> = {
      superadmin: [
        'Full platform administration',
        'Generate onboarding/offboarding emails',
        'Trigger WhatsApp messages',
        'Password reset management',
        'View all reports and analytics',
        'Manage all user roles'
      ],
      owner: [
        'Self-service signup',
        'Add/modify locations',
        'Bulk store upload via Excel',
        'Manage sections and questionnaires',
        'Add DMs, GMs, and employees',
        'Configure notification schedules',
        'View dashboard and trends'
      ],
      districtmanager: [
        'View assigned multiple stores',
        'Modify data for assigned locations',
        'View compliance adherence',
        'Educate users across stores',
        'Cannot signup new locations'
      ],
      generalmanager: [
        'Manage single location',
        'View and modify location data',
        'Cannot signup new locations',
        'Location-specific permissions only'
      ]
    };
    const key = String(role || 'owner');
    return permissions[key] || [];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(user.restaurant)
        ? user.restaurant.join(',').toLowerCase().includes(searchTerm.toLowerCase())
        : (user.restaurant || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesRestaurant = restaurantFilter === 'all' || (
      Array.isArray(user.restaurant)
        ? user.restaurant.includes(restaurantFilter)
        : (user.restaurant || '')
          .split(',')
          .map(id => id.trim())
          .includes(restaurantFilter)
    );
    return matchesSearch && matchesRole && matchesRestaurant;
  });

  // Restaurant options come from context

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    console.log('Original user data:', user);
    console.log('user.restaurant type:', typeof user.restaurant);
    console.log('user.restaurant value:', user.restaurant);
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!editingUser) return;
      const primaryId = getPrimaryId(editingUser);
      if (!primaryId) {
        alert('Cannot save: missing user id.');
        return;
      }

      const cleanArray = (arr?: any[]) => Array.isArray(arr) ? arr.filter((v) => typeof v === 'string' ? v.trim() !== '' : !!v) : [];

      const restaurantArray = Array.isArray(editingUser.restaurant)
        ? cleanArray(editingUser.restaurant as string[])
        : cleanArray(((editingUser.restaurant || '') as string).split(','));

      const editPayload = {
        ...editingUser,
        id: primaryId,
        restaurantID: restaurantArray, // Send as restaurantID to match backend
        restaurant: undefined, // Remove the frontend-only field
        superadminsID: cleanArray(editingUser.superadminsID as any),
        ownerID: cleanArray(editingUser.ownerID as any),
        districtmanagerID: cleanArray(editingUser.districtmanagerID as any),
        generalmanagerID: cleanArray(editingUser.generalmanagerID as any),
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/auth/admins/${primaryId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPayload),
      });

      if (!response.ok) throw new Error('Failed to update admin');

      await fetchUsers(); // Refetch to get updated data

      setShowEditModal(false);
      setEditingUser(null);
      showToast('success', 'User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      showToast('error', 'Error updating user');
    }
  };

  const handleInputChange = (field: keyof AdminUser | 'restaurant' | 'role' | string, value: any) => {
    setEditingUser(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const id = getPrimaryId(user);
    if (!id) {
      showToast('error', 'Missing user id');
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete ${user.fullName || 'this user'}? This action cannot be undone.`);
    if (!confirmDelete) return;
    try {
      setDeletingId(id);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/auth/admins/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete user');
      }
      setUsers(prev => prev.filter(u => (getPrimaryId(u) || '') !== id));
      showToast('success', 'User deleted');
    } catch (e: any) {
      showToast('error', e?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewUserChange = (field: string, value: any) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const generateEmail = (fullName: string, role: string) => {
  //   if (!fullName) return '';
  //   const cleanfullName = fullName.toLowerCase().replace(/\s+/g, '.');
  //   const rolePrefix = role === 'generalmanager' ? 'manager'
  //     : role === 'districtmanager' ? 'dm'
  //     : role === 'owner' ? 'owner'
  //     : role === 'employee' ? 'emp'
  //     : 'admin';
  //   return `${rolePrefix}.${cleanfullName}@opey.com`;
  // };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (!newUser.fullName || !newUser.email) {
        alert('Please fill in all required fields');
        return;
      }

      console.log('newUser.restaurantIDs:', newUser.restaurantIDs); // Debug

      // Create the request payload with hierarchy and selected restaurants
      const requestData = {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        restaurantID: newUser.restaurantIDs || [], // This should be an array
        phone: newUser.phone,
        password: newUser.password,
        superadminsID: newUser.superadminsID || [],
        ownerID: newUser.ownerID || [],
        districtmanagerID: newUser.districtmanagerID || [],
        generalmanagerID: newUser.generalmanagerID || [],
      };


      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/auth/admin-account`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      await response.json();

      // Refresh the users list
      await fetchUsers();

      // Reset form and close modal
      setNewUser({
        fullName: '',
        email: '',
        role: 'owner',
        restaurant: '',
        phone: '',
        password: '',
        superadminsID: [],
        ownerID: [],
        districtmanagerID: [],
        generalmanagerID: [],
        restaurantIDs: [],
      });
      showToast('success', 'User deleted');
      setShowAddModal(false);

      alert(`User created successfully! Password: ${newUser.password}`);
    } catch (err) {
      console.error('Error creating user:', err);
      setShowAddModal(false);
      showToast('error', 'failed to create user');
    }
  };

  // Auto-generate email when name or role changes


  // Check if current user can add users (only super_admin)
  const canAddUsers = currentUserRole === 'super_admin';

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600">
              <Shield className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Access Controller
          </h1>
          <p className="text-gray-600 mt-1">Manage role-based access control for Opey platform</p>
        </div>
        {canAddUsers && (
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {roles.map(role => {
          const count = users.filter(user => user.role === role.value).length;
          const Icon = role.icon;
          return (
            <div key={role.value} className="bg-white rounded-lg border p-4">
              <div className="flex items-center">
                <Icon className={`h-5 w-5 ${role.color}`} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">{role.label}s</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email or restaurant ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-64">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
            >
              <option value="all">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={String(r.id)} value={String(r.id)}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => {
                const roleInfo = getRoleInfo(String(user.role || 'owner'));
                const Icon = roleInfo.icon;
                return (
                  <tr key={getUserId(user) || user.email || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName ?? ''}</div>
                          <div className="text-sm text-gray-500">{user.email ?? nameToGmail(user.fullName)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Icon className={`h-4 w-4 ${roleInfo.color} mr-2`} />
                        <span className="text-sm text-gray-900">{roleInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const ids = Array.isArray(user.restaurant)
                          ? user.restaurant
                          : (user.restaurant || '').split(',').filter(Boolean);

                        if (ids.length === 0) return 'Not assigned';

                        const idToName = (id: string) => restaurants.find(r => String(r.id) === String(id))?.name;

                        const names = ids.map(idToName).filter(Boolean); // Filter out undefined values

                        return names.length > 0 ? names.join(', ') : 'Not assigned';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <Button
                          onClick={() => handleDeleteUser(user)}
                          // className={`p-2 rounded-lg transition-colors ${deletingId === getPrimaryId(user) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900 hover:bg-red-50'}`}
                          className="text-danger hover:bg-transparent bg-transparent"
                          title="Delete User"
                          icon={<Trash2 size={16} />}
                          disabled={deletingId === getPrimaryId(user)}
                        >
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Admin Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Admin Access:</span> Only Super Admins can create new users.
                    Email will be auto-generated based on role and name.
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newUser.fullName}
                      onChange={(e) => handleNewUserChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => handleNewUserChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                </div>
              </div>
              {/* Generated Credentials */}
              <div>
                {/* <h4 className="text-md font-medium text-gray-900 mb-4">Generated Credentials</h4> */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex">
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => handleNewUserChange('email', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                        placeholder="Email"
                      />
                      {/* <button
                        onClick={() => {
                          if (newUser.fullName) {
                            const generatedEmail = generateEmail(newUser.fullName, newUser.role);
                            handleNewUserChange('email', generatedEmail);
                          }
                        }}
                        className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors text-sm"
                        title="Regenerate Email"
                      >
                        🔄
                      </button> */}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newUser.password}
                        onChange={(e) => handleNewUserChange('password', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Click generate to create secure password"
                      />
                      <button
                        onClick={() => {
                          const generatedPassword = generatePassword();
                          handleNewUserChange('password', generatedPassword);
                        }}
                        className="px-3 py-2 bg-green-600 text-white border border-l-0 border-green-600 rounded-r-lg hover:bg-green-700 transition-colors text-sm"
                        title="Generate Password"
                      >
                        Generate
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      User will be required to change password on first login
                    </p>
                  </div>
                </div>
              </div>

              {/* Role & Access */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Role & Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Role *
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => handleNewUserChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurants
                    </label>
                    <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                      {restaurants.map((r) => (
                        <label key={String(r.id)} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600"
                            checked={newUser.restaurantIDs.includes(String(r.id))}
                            onChange={() => {
                              const key = String(r.id); // Ensure it's a string
                              const exists = newUser.restaurantIDs.includes(key);
                              const updated = exists
                                ? newUser.restaurantIDs.filter((id) => id !== key)
                                : [...newUser.restaurantIDs, key];
                              console.log('Updated restaurantIDs:', updated); // Debug log
                              handleNewUserChange('restaurantIDs', updated);
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-800">{r.name}</span>
                        </label>
                      ))}
                      {restaurants.length === 0 && (
                        <div className="text-sm text-gray-500 p-2">No restaurants available</div>
                      )}
                    </div>
                  </div>
                  {/* Hierarchy selectors */}
                  {/* <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Super Admins</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'superadmin').filter(u => !!getUserId(u)).map((u: AdminUser) => (
                          <label key={getUserId(u)} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600"
                              checked={(newUser.superadminsID || []).includes(getUserId(u))}
                              onChange={() => {
                                const current = newUser.superadminsID || [];
                                const key = getUserId(u);
                                const exists = current.includes(key);
                                const updated = exists ? current.filter((id) => id !== key) : [...current, key];
                                handleNewUserChange('superadminsID', updated);
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-800">{u.fullName || ''} {u.email ? `(${u.email})` : (u.fullName ? `(${nameToGmail(u.fullName)})` : '')}</span>
                          </label>
                        ))}
                        {users.filter(u => u.role === 'superadmin').length === 0 && (
                          <div className="text-sm text-gray-500 p-2">No super admins</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owners</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'owner').filter(u => !!getUserId(u)).map((u: AdminUser) => (
                          <label key={getUserId(u)} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600"
                              checked={(newUser.ownerID || []).includes(getUserId(u))}
                              onChange={() => {
                                const current = newUser.ownerID || [];
                                const key = getUserId(u);
                                const exists = current.includes(key);
                                const updated = exists ? current.filter((id) => id !== key) : [...current, key];
                                handleNewUserChange('ownerID', updated);
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-800">{u.fullName || ''} {u.email ? `(${u.email})` : (u.fullName ? `(${nameToGmail(u.fullName)})` : '')}</span>
                          </label>
                        ))}
                        {users.filter(u => u.role === 'owner').length === 0 && (
                          <div className="text-sm text-gray-500 p-2">No owners</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District Managers</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'districtmanager').filter(u => !!getUserId(u)).map((u: AdminUser) => (
                          <label key={getUserId(u)} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600"
                              checked={(newUser.districtmanagerID || []).includes(getUserId(u))}
                              onChange={() => {
                                const current = newUser.districtmanagerID || [];
                                const key = getUserId(u);
                                const exists = current.includes(key);
                                const updated = exists ? current.filter((id) => id !== key) : [...current, key];
                                handleNewUserChange('districtmanagerID', updated);
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-800">{u.fullName || ''} {u.email ? `(${u.email})` : (u.fullName ? `(${nameToGmail(u.fullName)})` : '')}</span>
                          </label>
                        ))}
                        {users.filter(u => u.role === 'districtmanager').length === 0 && (
                          <div className="text-sm text-gray-500 p-2">No district managers</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">General Managers</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'generalmanager').filter(u => !!getUserId(u)).map((u: AdminUser) => (
                          <label key={getUserId(u)} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600"
                              checked={(newUser.generalmanagerID || []).includes(getUserId(u))}
                              onChange={() => {
                                const current = newUser.generalmanagerID || [];
                                const key = getUserId(u);
                                const exists = current.includes(key);
                                const updated = exists ? current.filter((id) => id !== key) : [...current, key];
                                handleNewUserChange('generalmanagerID', updated);
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-800">{u.fullName || ''} {u.email ? `(${u.email})` : (u.fullName ? `(${nameToGmail(u.fullName)})` : '')}</span>
                          </label>
                        ))}
                        {users.filter(u => u.role === 'generalmanager').length === 0 && (
                          <div className="text-sm text-gray-500 p-2">No general managers</div>
                        )}
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>



              {/* Role Permissions Preview */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Role Permissions</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    {(() => {
                      const roleInfo = getRoleInfo(newUser.role);
                      const Icon = roleInfo.icon;
                      return (
                        <>
                          <Icon className={`h-5 w-5 ${roleInfo.color} mr-2`} />
                          <span className="font-medium text-gray-900">{roleInfo.label}</span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {getRolePermissions(newUser.role).map((permission, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 bg-green-400 rounded-full mr-2"></div>
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg transition-colors ${isAddFormValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
                disabled={!isAddFormValid}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editingUser.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editingUser.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Permissions */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Role & Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Role *
                    </label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurants</label>
                    <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                      {restaurants.map((r) => {
                        const currentRestaurantIDs = Array.isArray(editingUser.restaurant)
                          ? (editingUser.restaurant as string[])
                          : ((editingUser.restaurant || '') as string).split(',').filter(Boolean);

                        const restaurantIdString = String(r.id);
                        const isChecked = currentRestaurantIDs.includes(restaurantIdString);

                        return (
                          <label key={restaurantIdString} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600"
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked
                                  ? currentRestaurantIDs.filter((id) => id !== restaurantIdString)
                                  : [...currentRestaurantIDs, restaurantIdString];
                                console.log('Updated restaurant array:', updated); // Debug log
                                handleInputChange('restaurant', updated); // Keep as array!
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-800">{r.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {/* Edit hierarchy selectors */}
                  {/* <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Super Admins</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'superadmin').map((u) => {
                          const current: string[] = editingUser.superadminsID || [];
                          const key = getPrimaryId(u);
                          if (!key) return null;
                          const isChecked = current.includes(key);
                          return (
                            <label key={key} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked ? current.filter((id) => id !== key) : [...current, key];
                                  handleInputChange('superadminsID', updated);
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-800">{u.fullName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owners</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'owner').map((u) => {
                          const current: string[] = editingUser.ownerID || [];
                          const key = getPrimaryId(u);
                          if (!key) return null;
                          const isChecked = current.includes(key);
                          return (
                            <label key={key} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked ? current.filter((id) => id !== key) : [...current, key];
                                  handleInputChange('ownerID', updated);
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-800">{u.fullName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District Managers</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'districtmanager').map((u) => {
                          const current: string[] = editingUser.districtmanagerID || [];
                          const key = getPrimaryId(u);
                          if (!key) return null;
                          const isChecked = current.includes(key);
                          return (
                            <label key={key} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked ? current.filter((id) => id !== key) : [...current, key];
                                  handleInputChange('districtmanagerID', updated);
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-800">{u.fullName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">General Managers</label>
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.role === 'generalmanager').map((u) => {
                          const current: string[] = editingUser.generalmanagerID || [];
                          const key = getPrimaryId(u);
                          if (!key) return null;
                          const isChecked = current.includes(key);
                          return (
                            <label key={key} className="flex items-center p-1.5 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked ? current.filter((id) => id !== key) : [...current, key];
                                  handleInputChange('generalmanagerID', updated);
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-800">{u.fullName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Role Permissions Preview */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Role Permissions</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    {(() => {
                      const roleInfo = getRoleInfo(String(editingUser.role || 'owner'));
                      const Icon = roleInfo.icon;
                      return (
                        <>
                          <Icon className={`h-5 w-5 ${roleInfo.color} mr-2`} />
                          <span className="font-medium text-gray-900">{roleInfo.label}</span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="space-y-1">
                    {getRolePermissions(String(editingUser.role || 'owner')).map((permission, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 bg-green-400 rounded-full mr-2"></div>
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">
                    {selectedUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedUser.fullName}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center mt-1">
                    {(() => {
                      const roleInfo = getRoleInfo(String(selectedUser?.role || 'owner'));
                      const Icon = roleInfo.icon;
                      return (
                        <>
                          <Icon className={`h-4 w-4 ${roleInfo.color} mr-1`} />
                          <span className="text-sm text-gray-700">{roleInfo.label}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h5>
                <div className="space-y-1">
                  {getRolePermissions(String(selectedUser?.role || 'owner')).map((permission: string, index: number) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 bg-green-400 rounded-full mr-2"></div>
                      {permission}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Restaurant:</span>
                  <p className="text-gray-600">
                    {(() => {
                      if (!selectedUser.restaurant) return 'Not assigned';

                      const ids = Array.isArray(selectedUser.restaurant)
                        ? selectedUser.restaurant
                        : String(selectedUser.restaurant).split(',').filter(Boolean);

                      const names = ids
                        .map(id => restaurants.find(r => String(r.id) === String(id))?.name)
                        .filter(Boolean);

                      return names.length > 0 ? names.join(', ') : 'Not assigned';
                    })()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Phone:</span>
                  <p className="text-gray-600">{selectedUser.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AccessController;