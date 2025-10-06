import { useState, useEffect } from 'react';
import { useDashboard } from '../contexts/DashboardContext'; // Update the import path
import { 
  Bell, 
  Mail, 
  MessageCircle, 
  Clock, 
  Users, 
  Shield, 
  Building2, 
  MapPin, 
  UserCheck,
  Save,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Send,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// Type definitions
interface Notification {
  _id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: string;
  dayOfMonth?: number;
  channels: {
    email: boolean;
    whatsapp: boolean;
  };
  recipients: {
    super_admin: boolean;
    owner: boolean;
    district_manager: boolean;
    general_manager: boolean;
    employee: boolean;
  };
  filters: {
    restaurants: 'all' | 'specific';
    sections: 'all' | 'specific';
    dateRange: number;
    selectedRestaurants: string[];
    selectedSections: string[];
  };
  active: boolean;
  recipientCount: number;
  nextSend?: string | Date;
  lastSent?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

interface NewNotification {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  timeZone?: string;
  dayOfWeek: string;
  dayOfMonth: number;
  channels: {
    email: boolean;
    whatsapp: boolean;
  };
  recipients: {
    super_admin: boolean;
    owner: boolean;
    district_manager: boolean;
    general_manager: boolean;
    employee: boolean;
  };
  filters: {
    restaurants: 'all' | 'specific';
    sections: 'all' | 'specific';
    dateRange: number;
    selectedRestaurants: string[];
    selectedSections: string[];
  };
  active: boolean;
}

// interface Restaurant {
//   id: string;
//   name: string;
// }

interface Section {
  id: string;
  name: string;
  restaurantId?: string;
}

const ReportNotifications = () => {
  // Get restaurants and sections from context
  const { restaurants, sections } = useDashboard();
  
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [testingNotification, setTestingNotification] = useState<string | null>(null);
  
  const [newNotification, setNewNotification] = useState<NewNotification>({
    name: '',
    frequency: 'daily',
    time: '09:00',
    timeZone: 'America/Toronto',
    dayOfWeek: 'monday',
    dayOfMonth: 1,
    channels: {
      email: true,
      whatsapp: false
    },
    recipients: {
      super_admin: false,
      owner: false,
      district_manager: false,
      general_manager: true,
      employee: false
    },
    filters: {
      restaurants: 'all',
      sections: 'all',
      dateRange: 7,
      selectedRestaurants: [],
      selectedSections: []
    },
    active: true
  });

  const roles = [
    { value: 'super_admin', label: 'Super Admin', icon: Shield, color: 'text-red-600' },
    { value: 'owner', label: 'Owner', icon: Building2, color: 'text-blue-600' },
    { value: 'district_manager', label: 'District Manager', icon: MapPin, color: 'text-green-600' },
    { value: 'general_manager', label: 'General Manager', icon: UserCheck, color: 'text-yellow-600' },
    // { value: 'employee', label: 'Employee', icon: Users, color: 'text-gray-600' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily', description: 'Send once per day at specified time' },
    { value: 'weekly', label: 'Weekly', description: 'Send once per week on specified day' },
    { value: 'monthly', label: 'Monthly', description: 'Send once per month on specified date' }
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/notifications/reports`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewNotification, value: any) => {
    setNewNotification(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: keyof NewNotification, field: string, value: any) => {
    setNewNotification(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as Record<string, any>),
        [field]: value
      }
    }));
  };

  // Handle restaurant selection
  const handleRestaurantSelection = (restaurantId: string, checked: boolean) => {
    setNewNotification(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        selectedRestaurants: checked 
          ? [...prev.filters.selectedRestaurants, restaurantId]
          : prev.filters.selectedRestaurants.filter(id => id !== restaurantId)
      }
    }));
  };

  // Handle section selection
  const handleSectionSelection = (sectionId: string, checked: boolean) => {
    setNewNotification(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        selectedSections: checked 
          ? [...prev.filters.selectedSections, sectionId]
          : prev.filters.selectedSections.filter(id => id !== sectionId)
      }
    }));
  };

  // Filter sections based on selected restaurants
  const getFilteredSections = (): Section[] => {
    if (newNotification.filters.restaurants === 'all') {
      return sections;
    } else if (newNotification.filters.restaurants === 'specific' && newNotification.filters.selectedRestaurants.length > 0) {
      return sections.filter((section: Section) => 
        section.restaurantId && newNotification.filters.selectedRestaurants.includes(section.restaurantId)
      );
    }
    return sections;
  };

  const handleSaveNotification = async () => {
    try {
      setLoading(true);
      
      const payload = {
        ...newNotification,
        recipientCount: calculateRecipientCount()
      };

      if (editingNotification) {
        // Update existing notification
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/notifications/reports-add`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...payload, id: editingNotification._id })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update notification');
        }
        
        const updatedNotification = await response.json();
        setNotifications(prev => 
          prev.map(n => n._id === editingNotification._id ? updatedNotification : n)
        );
      } else {
        // Create new notification
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/notifications/reports-add`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create notification');
        }
        
        const createdNotification = await response.json();
        setNotifications(prev => [...prev, createdNotification]);
      }
      
      resetForm();
      setShowAddModal(false);
      setEditingNotification(null);
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Failed to save notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateRecipientCount = (): number => {
    // Mock calculation - in real app this would query actual users
    const counts: Record<string, number> = {
      super_admin: 1,
      owner: 3,
      district_manager: 2,
      general_manager: 8,
      employee: 20
    };
    
    return Object.entries(newNotification.recipients)
      .filter(([, selected]) => selected)
      .reduce((total, [role]) => total + (counts[role] || 0), 0);
  };

  const resetForm = () => {
    setNewNotification({
      name: '',
      frequency: 'daily',
      time: '09:00',
      dayOfWeek: 'monday',
      dayOfMonth: 1,
      channels: {
        email: true,
        whatsapp: false
      },
      recipients: {
        super_admin: false,
        owner: false,
        district_manager: false,
        general_manager: true,
        employee: false
      },
      filters: {
        restaurants: 'all',
        sections: 'all',
        dateRange: 7,
        selectedRestaurants: [],
        selectedSections: []
      },
      active: true
    });
  };

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setNewNotification({ 
      ...notification,
      dayOfWeek: notification.dayOfWeek || 'monday',
      dayOfMonth: notification.dayOfMonth || 1
    });
    setShowAddModal(true);
  };

  const handleDeleteNotification = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/notifications/reports-add`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }
        
        setNotifications(prev => prev.filter(n => n._id !== id));
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setLoading(true);
      const notification = notifications.find(n => n._id === id);
      if (!notification) return;
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/notifications/reports-add`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...notification, id: notification._id, active: !notification.active })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle notification status');
      }
      
      const updatedNotification = await response.json();
      setNotifications(prev => 
        prev.map(n => n._id === id ? updatedNotification : n)
      );
    } catch (error) {
      console.error('Error toggling notification status:', error);
      alert('Failed to update notification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (notification: Notification) => {
    try {
      setTestingNotification(notification._id);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/notifications/test-notification`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: notification._id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const channelNames = Object.entries(result.notification.channels)
          .filter(([, v]) => v)
          .map(([k]) => k === 'whatsapp' ? 'WhatsApp' : 'Email')
          .join(', ');
        
        alert(`✅ Test notification sent successfully!\n\n📊 Report: ${result.notification.name}\n📱 Channels: ${channelNames}\n👥 Recipients: ${result.notification.recipientCount} users\n\n${result.results && result.results.length > 0 ? `Results: ${JSON.stringify(result.results, null, 2)}` : ''}`);
      } else {
        const errorMessage = result.message || 'Unknown error occurred';
        if (errorMessage.includes('No data found')) {
          alert(`⚠️ No Data Found\n\n📊 Report: ${result.notification?.name || 'Unknown'}\n\nNo inspection data was found for the selected criteria:\n• Date range: Last ${newNotification.filters.dateRange} days\n• Restaurants: ${newNotification.filters.restaurants === 'all' ? 'All' : newNotification.filters.selectedRestaurants.length + ' specific'}\n• Sections: ${newNotification.filters.sections === 'all' ? 'All' : newNotification.filters.selectedSections.length + ' specific'}\n\nTry adjusting your filters or selecting a different date range.`);
        } else {
          alert(`❌ Failed to send test notification: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('❌ Failed to send test notification. Please try again.');
    } finally {
      setTestingNotification(null);
    }
  };

  const handleSendNow = async () => {
    try {
      setLoading(true);
      
      // Use current notification filters for Send Now
      const filters = {
        dateRange: 7, // Default to last 7 days for Send Now
        restaurants: 'all',
        sections: 'all',
        selectedRestaurants: [],
        selectedSections: []
      };
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/notifications/generate-csv-now`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Open the download link in a new tab
        window.open(result.downloadLink, '_blank');
        
        if (result.isEmpty) {
          alert(`⚠️ Empty Report Generated\n\n📊 Records: ${result.recordCount}\n📁 File: ${result.filename}\n🔗 Download started automatically\n\nNo inspection data found for the selected criteria.`);
        } else {
          alert(`✅ Report generated successfully!\n\n📊 Records: ${result.recordCount}\n📁 File: ${result.filename}\n🔗 Download started automatically`);
        }
      } else {
        alert(`❌ Failed to generate report: ${result.message}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const formatNextSend = (nextSend: string | Date | undefined): string => {
    if (!nextSend) return 'Not scheduled';
    if (typeof nextSend === 'string' && !nextSend.includes('T')) {
      return nextSend;
    }
    try {
      return new Date(nextSend).toLocaleString();
    } catch {
      return String(nextSend);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Report Notifications
          </h1>
          <p className="text-gray-600 mt-1">Manage automated report delivery via email and WhatsApp</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSendNow}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Now
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Notification
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {notifications.filter(n => n.active).length}
              </p>
              <p className="text-xs text-gray-500">Active Notifications</p>
            </div>
          </div>
        </div>
        {/* <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Send className="h-5 w-5 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {notifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Total Recipients</p>
            </div>
          </div>
        </div> */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {notifications.filter(n => n.frequency === 'daily').length}
              </p>
              <p className="text-xs text-gray-500">Daily Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Configured Notifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channels
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Send
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{notification.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{notification.frequency}</div>
                    <div className="text-xs text-gray-500">
                      {notification.frequency === 'daily' && `at ${notification.time}`}
                      {notification.frequency === 'weekly' && `${notification.dayOfWeek}s at ${notification.time}`}
                      {notification.frequency === 'monthly' && `${notification.dayOfMonth}${getOrdinalSuffix(notification.dayOfMonth || 1)} at ${notification.time}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {notification.channels?.email && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </span>
                      )}
                      {notification.channels?.whatsapp && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          WhatsApp
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <div className="text-sm text-gray-900">{notification.recipientCount || 0} users</div> */}
                    <div className="text-xs text-gray-500">
                      {notification.recipients && Object.entries(notification.recipients)
                        .filter(([, selected]) => selected)
                        .map(([role]) => roles.find(r => r.value === role)?.label)
                        .join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNextSend(notification.nextSend)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(notification._id)}
                      className="flex items-center"
                    >
                      {notification.active ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-green-600" />
                          <span className="ml-1 text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                          <span className="ml-1 text-sm text-gray-500">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleTestNotification(notification)}
                        disabled={testingNotification === notification._id}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Test Notification"
                      >
                        {testingNotification === notification._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditNotification(notification)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors"
                        title="Edit Notification"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notifications.length === 0 && (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications configured</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first automated report notification to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Notification
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Notification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingNotification ? 'Edit Notification' : 'Add New Notification'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNotification(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Name *
                  </label>
                  <input
                    type="text"
                    value={newNotification.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Daily GM Reports"
                  />
                </div>
                
                
              </div>

              {/* Schedule Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Schedule Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      value={newNotification.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {frequencies.map(freq => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newNotification.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {newNotification.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Week
                      </label>
                      <select
                        value={newNotification.dayOfWeek}
                        onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                  )}
                  
                  {newNotification.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={newNotification.dayOfMonth}
                        onChange={(e) => handleInputChange('dayOfMonth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  {/* Time Zone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                  </label>
                  <select
                    value={newNotification.timeZone || 'America/Toronto'}
                    onChange={(e) => handleInputChange('timeZone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="America/St_Johns">Newfoundland Time (NT) (UTC-3:30)</option>
                    <option value="America/Halifax">Atlantic Time (AT) (UTC-4)</option>
                    <option value="America/Toronto">Eastern Time (ET) (UTC-5)</option>
                    <option value="America/Winnipeg">Central Time (CT) (UTC-6)</option>
                    <option value="America/Regina">Saskatchewan Time (SK) (UTC-6)</option>
                    <option value="America/Edmonton">Mountain Time (MT) (UTC-7)</option>
                    <option value="America/Vancouver">Pacific Time (PT) (UTC-8)</option>
                    <option value="America/Whitehorse">Yukon Time (YT) (UTC-8)</option>
                  </select>
                </div>
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Delivery Channels</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-4 border border-gray-300 rounded-lg">
                    <input
                      type="checkbox"
                      id="email"
                      checked={newNotification.channels.email}
                      onChange={(e) => handleNestedInputChange('channels', 'email', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="email" className="ml-3 flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Email</div>
                        <div className="text-xs text-gray-500">Send via email notifications</div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center p-4 border border-gray-300 rounded-lg">
                    <input
                      type="checkbox"
                      id="whatsapp"
                      checked={newNotification.channels.whatsapp}
                      onChange={(e) => handleNestedInputChange('channels', 'whatsapp', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="whatsapp" className="ml-3 flex items-center">
                      <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">WhatsApp</div>
                        <div className="text-xs text-gray-500">Send via WhatsApp messages</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Recipients by Role</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map(role => {
                    const Icon = role.icon;
                    return (
                      <div key={role.value} className="flex items-center p-4 border border-gray-300 rounded-lg">
                        <input
                          type="checkbox"
                          id={role.value}
                          checked={newNotification.recipients[role.value as keyof typeof newNotification.recipients]}
                          onChange={(e) => handleNestedInputChange('recipients', role.value, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={role.value} className="ml-3 flex items-center">
                          <Icon className={`h-5 w-5 ${role.color} mr-2`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{role.label}</div>
                            <div className="text-xs text-gray-500">Include all {role.label.toLowerCase()}s</div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Report Filters */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Report Filters</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Selection
                      </label>
                      <select
                        value={newNotification.filters.restaurants}
                        onChange={(e) => {
                          handleNestedInputChange('filters', 'restaurants', e.target.value);
                          // Clear selected restaurants when changing to 'all'
                          if (e.target.value === 'all') {
                            handleNestedInputChange('filters', 'selectedRestaurants', []);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Restaurants</option>
                        <option value="specific">Select Specific Restaurants</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Selection
                      </label>
                      <select
                        value={newNotification.filters.sections}
                        onChange={(e) => {
                          handleNestedInputChange('filters', 'sections', e.target.value);
                          // Clear selected sections when changing to 'all'
                          if (e.target.value === 'all') {
                            handleNestedInputChange('filters', 'selectedSections', []);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Sections</option>
                        <option value="specific">Select Specific Sections</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Range (days)
                      </label>
                      <select
                        value={newNotification.filters.dateRange}
                        onChange={(e) => handleNestedInputChange('filters', 'dateRange', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={1}>Last 1 day</option>
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                      </select>
                    </div>
                  </div>

                  {/* Specific Restaurant Selection */}
                  {newNotification.filters.restaurants === 'specific' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Restaurants ({restaurants.length} available)
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {restaurants.map(restaurant => (
                            <div key={restaurant.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                id={`restaurant-${restaurant.id}`}
                                checked={newNotification.filters.selectedRestaurants.includes(restaurant.id)}
                                onChange={(e) => handleRestaurantSelection(restaurant.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`restaurant-${restaurant.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                                {restaurant.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        {restaurants.length === 0 && (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No restaurants available
                          </div>
                        )}
                      </div>
                      {newNotification.filters.selectedRestaurants.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          Selected: {newNotification.filters.selectedRestaurants.length} restaurant(s)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specific Section Selection */}
                  {newNotification.filters.sections === 'specific' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Sections ({getFilteredSections().length} available)
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {getFilteredSections().map(section => (
                            <div key={section.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                id={`section-${section.id}`}
                                checked={newNotification.filters.selectedSections.includes(section.id)}
                                onChange={(e) => handleSectionSelection(section.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`section-${section.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                                {section.name}
                                {section.restaurantId && newNotification.filters.restaurants === 'all' && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({restaurants.find(r => r.id === section.restaurantId)?.name || 'Unknown'})
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                        {getFilteredSections().length === 0 && (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No sections available
                          </div>
                        )}
                      </div>
                      {newNotification.filters.selectedSections.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          Selected: {newNotification.filters.selectedSections.length} section(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Preview</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Bell className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-2">Notification Summary:</div>
                      <div className="space-y-1">
                        <div>• <strong>Name:</strong> {newNotification.name || 'Not specified'}</div>
                        <div>• <strong>Schedule:</strong> {frequencies.find(f => f.value === newNotification.frequency)?.label}
                          {newNotification.frequency === 'daily' && ` at ${newNotification.time}`}
                          {newNotification.frequency === 'weekly' && ` on ${newNotification.dayOfWeek}s at ${newNotification.time}`}
                          {newNotification.frequency === 'monthly' && ` on ${newNotification.dayOfMonth}${getOrdinalSuffix(newNotification.dayOfMonth || 1)} at ${newNotification.time}`}
                        </div>
                        <div>• <strong>Channels:</strong> {Object.entries(newNotification.channels).filter(([, v]) => v).map(([k]) => k === 'whatsapp' ? 'WhatsApp' : 'Email').join(', ') || 'None selected'}</div>
                        <div>• <strong>Recipients:</strong> {Object.entries(newNotification.recipients).filter(([, selected]) => selected).map(([role]) => roles.find(r => r.value === role as keyof typeof newNotification.recipients)?.label).join(', ') || 'None selected'}</div>
                        <div>• <strong>Estimated Recipients:</strong> {calculateRecipientCount()} users</div>
                        <div>• <strong>Restaurants:</strong> {
                          newNotification.filters.restaurants === 'all' ? 'All restaurants' :
                          newNotification.filters.selectedRestaurants.length > 0 ? 
                            `${newNotification.filters.selectedRestaurants.length} specific restaurant(s)` : 
                            'None selected'
                        }</div>
                        <div>• <strong>Sections:</strong> {
                          newNotification.filters.sections === 'all' ? 'All sections' :
                          newNotification.filters.selectedSections.length > 0 ? 
                            `${newNotification.filters.selectedSections.length} specific section(s)` : 
                            'None selected'
                        }</div>
                        <div>• <strong>Date Range:</strong> Last {newNotification.filters.dateRange} days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Status</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={newNotification.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-3 text-sm text-gray-900">
                    <span className="font-medium">Active</span>
                    <span className="block text-gray-500">Enable this notification to start sending reports</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNotification(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotification}
                disabled={!newNotification.name || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingNotification ? 'Update Notification' : 'Create Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportNotifications;