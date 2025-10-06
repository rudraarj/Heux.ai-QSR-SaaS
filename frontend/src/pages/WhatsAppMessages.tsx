import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Clock, Calendar, X, Trash2, Filter, MapPin, PlayCircle } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { WhatsAppNotification } from '../types';
import axios from 'axios';
import { toast } from 'react-toastify';

interface NotificationFormData {
  restaurantId: string;
  sectionId: string;
  frequency: 'daily' | 'alternate';
  time: string;
  timeZone: string;
}

// Canadian time zones
const CANADIAN_TIME_ZONES = [
  { value: 'America/St_Johns', label: 'Newfoundland Time (NT)', offset: 'UTC-3:30' },
  { value: 'America/Halifax', label: 'Atlantic Time (AT)', offset: 'UTC-4' },
  { value: 'America/Toronto', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Winnipeg', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Regina', label: 'Saskatchewan Time (SK)', offset: 'UTC-6' },
  { value: 'America/Edmonton', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Vancouver', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Whitehorse', label: 'Yukon Time (YT)', offset: 'UTC-8' }
];

// Helper function to format the next trigger time display
const formatNextTriggerTime = (notification: WhatsAppNotification): string => {
  const now = new Date();
  const [hours, minutes] = notification.time.split(':').map(Number);
  const timeZone = notification.timeZone || 'America/Toronto';
  
  // Get today's date in the notification's timezone
  const today = new Date(now.toLocaleString("en-US", { timeZone }));
  today.setHours(hours, minutes, 0, 0);
  
  // Check if notification time has passed today
  const nowInZone = new Date(now.toLocaleString("en-US", { timeZone }));
  
  let nextTrigger = new Date(today);
  
  // If time has passed today, schedule for tomorrow
  if (today <= nowInZone) {
    nextTrigger.setDate(today.getDate() + 1);
  }
  
  
  // Format the display
  const timeZoneInfo = CANADIAN_TIME_ZONES.find(tz => tz.value === timeZone);
  const formattedTime = nextTrigger.toLocaleString('en-US', {
    timeZone: timeZone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return `${formattedTime} (${timeZoneInfo?.label || 'ET'})`;
};

const WhatsAppMessages = () => {
  const { restaurants, sections } = useDashboard();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [formData, setFormData] = useState<NotificationFormData>({
    restaurantId: '',
    sectionId: '',
    frequency: 'daily',
    time: '09:00',
    timeZone: 'America/Toronto', // Default to Eastern Time
  });

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/data/getnotification`, {
        withCredentials: true,
      });
      const allNotifications = resp.data.allNotification || [];
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  // Manually trigger a notification for testing
  const triggerNotificationManually = async (notification: WhatsAppNotification) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/data/trigger-notification`, {
        restaurantId: notification.restaurantId,
        sectionId: notification.sectionId,
      }, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        toast.success(`Notification triggered successfully for ${response.data.summary.total} employee(s)`);
      } else {
        toast.error('Failed to trigger notification');
      }
    } catch (error) {
      console.error('Error triggering notification:', error);
      toast.error('Failed to trigger notification');
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.restaurantId || !formData.sectionId || !formData.frequency || !formData.time || !formData.timeZone) {
      toast.warning('Please fill all fields before submitting.', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    try {
      const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/data/notification`, formData, {
        withCredentials: true,
      });
      
      if (resp.data.success) {
        setNotifications(resp.data.allNotification || []);
        const timeZoneLabel = CANADIAN_TIME_ZONES.find(tz => tz.value === formData.timeZone)?.label || 'Selected Time Zone';
        toast.success(`New Notification Added for ${timeZoneLabel}! It will be handled by the backend scheduler.`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        
        // Refresh scheduler status
      } else {
        toast.error(resp.data.message || 'Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Something went wrong while creating notification');
    }
    
    setShowCreateForm(false);
    setFormData({
      restaurantId: '',
      sectionId: '',
      frequency: 'daily',
      time: '09:00',
      timeZone: 'America/Toronto',
    });
  };

  const deleteNotification = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const resp = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}api/data/notification/${id}`, {
          withCredentials: true,
        });
        
        if (resp.data.success) {
          setNotifications(resp.data.allNotification || []);
          toast.success('Notification deleted successfully', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
          
        } else {
          toast.error(resp.data.message || 'Failed to delete notification', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      }
    }
  };

  // Load notifications and scheduler status on component mount
  useEffect(() => {
    fetchNotifications();
    
  }, []);

  // Filter notifications based on selected restaurant and section
  const filteredNotifications = notifications.filter(notification => {
    const matchesRestaurant = selectedRestaurant === 'all' || notification.restaurantId === selectedRestaurant;
    const matchesSection = selectedSection === 'all' || notification.sectionId === selectedSection;
    return matchesRestaurant && matchesSection;
  });

  // Group notifications by restaurant
  const notificationsByRestaurant = restaurants.reduce((acc, restaurant) => {
    const restaurantNotifications = filteredNotifications.filter(n => n.restaurantId === restaurant.id);
    if (restaurantNotifications.length > 0) {
      acc[restaurant.id] = restaurantNotifications;
    }
    return acc;
  }, {} as Record<string, WhatsAppNotification[]>);

  // Get available sections based on selected restaurant
  const availableSections = selectedRestaurant === 'all' 
    ? sections 
    : sections.filter(section => section.restaurantId === selectedRestaurant);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Messages</h2>
         
        </div>
        <div className="flex items-center space-x-3">
          {schedulerStatus && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{schedulerStatus.totalJobs || 0}</span> scheduled jobs
            </div>
          )}
          <Button icon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
            Create Message
          </Button>
        </div>
      </div>

      {/* Scheduler Status Card */}
      {schedulerStatus && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Backend Scheduler Status</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {schedulerStatus.totalJobs} job(s) currently scheduled and running on the server
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center flex-1">
              <Filter size={16} className="text-gray-500 mr-2" />
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                value={selectedRestaurant}
                onChange={(e) => {
                  setSelectedRestaurant(e.target.value);
                  setSelectedSection('all'); // Reset section when restaurant changes
                }}
              >
                <option value="all">All Restaurants</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center flex-1">
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={selectedRestaurant === 'all'}
              >
                <option value="all">All Sections</option>
                {availableSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Message Form */}
      {showCreateForm && (
        <div className='h-[100%]'>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 animate-slide-in-right">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create Message</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => setShowCreateForm(false)}
                  icon={<X size={16} />}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleCreateNotification} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Restaurant
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.restaurantId}
                      onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value, sectionId: '' })}
                      required
                    >
                      <option value="">Select a restaurant</option>
                      {restaurants.map(restaurant => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Section
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      required
                      disabled={!formData.restaurantId}
                    >
                      <option value="">Select a section</option>
                      {formData.restaurantId && sections
                        .filter(section => section.restaurantId === formData.restaurantId)
                        .map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin size={16} className="inline mr-1" />
                      Canadian Time Zone
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.timeZone}
                      onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                      required
                    >
                      {CANADIAN_TIME_ZONES.map(tz => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label} ({tz.offset})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'alternate' })}
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="alternate">Every Alternate Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time ({CANADIAN_TIME_ZONES.find(tz => tz.value === formData.timeZone)?.label})
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </form>
              </div>
               
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNotification}>
                    Create Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages by Restaurant */}
      <div className="space-y-6">
        {Object.entries(notificationsByRestaurant).map(([restaurantId, restaurantNotifications]) => {
          const restaurant = restaurants.find(r => r.id === restaurantId);
          if (!restaurant) return null;
          
          return (
            <Card key={restaurantId}>
              <CardHeader>
                <CardTitle>{restaurant.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurantNotifications.map(notification => {
                    const section = sections.find(s => s.id === notification.sectionId);
                    const timeZoneInfo = CANADIAN_TIME_ZONES.find(tz => tz.value === (notification.timeZone || 'America/Toronto'));
                    
                    return (
                      <div 
                        key={notification.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <MessageSquare size={20} className="text-primary-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">
                                {section?.name}
                              </h3>
                              {/* <Badge variant="success">
                                Backend Scheduled
                              </Badge> */}
                            </div>
                            
                            <div className="mt-1 space-y-1 text-sm text-gray-500">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Calendar size={14} className="mr-1" />
                                  <span className="capitalize">{notification.frequency}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-1" />
                                  <span>{notification.time}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin size={14} className="mr-1" />
                                  <span>{timeZoneInfo?.label || 'Eastern Time'}</span>
                                </div>
                              </div>
                              {/* <div className="text-xs text-gray-400">
                                Next trigger: {formatNextTriggerTime(notification)}
                              </div> */}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => triggerNotificationManually(notification)}
                            icon={<PlayCircle size={16} />}
                            className="text-blue-500 hover:text-blue-600"
                            title="Trigger now for testing"
                          >
                            Send Now
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            icon={<Trash2 size={16} />}
                            className="text-danger hover:text-danger"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {Object.keys(notificationsByRestaurant).length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No messages found.</p>
            {selectedRestaurant !== 'all' || selectedSection !== 'all' ? (
              <p className="text-gray-500 mt-2">
                Try adjusting your filter criteria.
              </p>
            ) : (
              <div className="mt-4">
                <Button icon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
                  Create Your First Message
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppMessages;