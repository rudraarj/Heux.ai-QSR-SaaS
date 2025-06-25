import React, { useEffect, useState, useRef } from 'react';
import { Plus, MessageSquare, Clock, Calendar, X, Trash2, Filter, MapPin } from 'lucide-react';
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

// Backend API function to trigger notification
const triggerNotification = async (restaurantId: string, sectionId: string) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/data/trigger-notification`, {
      restaurantId,
      sectionId,
    }, {
      withCredentials: true,
    });
    
    console.log('Notification triggered successfully:', response.data);
  } catch (error) {
    console.error('Error triggering notification:', error);
  }
};

// Helper function to get current time in a specific timezone
const getCurrentTimeInTimezone = (timeZone: string): Date => {
  const now = new Date();
  // Create a new date representing the current time in the target timezone
  const timeInZone = new Date(now.toLocaleString("en-US", { timeZone }));
  return timeInZone;
};

// Helper function to create a date with specific time in a specific timezone
const createDateInTimezone = (timeZone: string, time: string, baseDate?: Date): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const base = baseDate || new Date();
  
  // Get the current date in the target timezone
  const dateInZone = new Date(base.toLocaleString("en-US", { timeZone }));
  
  // Set the time components
  dateInZone.setHours(hours, minutes, 0, 0);
  
  // Convert back to local time for setTimeout
  // We need to calculate the offset between the timezone and local time
  const localTime = new Date(base);
  const utcTime = new Date(base.toLocaleString("en-US", { timeZone: "UTC" }));
  const targetTime = new Date(base.toLocaleString("en-US", { timeZone }));
  
  // Calculate the difference between target timezone and local timezone
  const localOffset = localTime.getTime() - utcTime.getTime();
  const targetOffset = targetTime.getTime() - utcTime.getTime();
  const offsetDiff = targetOffset - localOffset;
  
  // Apply the offset to our target date
  const resultDate = new Date(dateInZone.getTime() - offsetDiff);
  
  return resultDate;
};

const WhatsAppMessages = () => {
  const { restaurants, sections } = useDashboard();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [formData, setFormData] = useState<NotificationFormData>({
    restaurantId: '',
    sectionId: '',
    frequency: 'daily',
    time: '09:00',
    timeZone: 'America/Toronto', // Default to Eastern Time
  });

  // Ref to store timeout IDs for cleanup
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Function to calculate next trigger time in Canadian timezone
  const calculateNextTriggerTime = (notification: WhatsAppNotification, lastTriggered?: Date): Date => {
    const notificationTimeZone = notification.timeZone || 'America/Toronto';
    const currentTimeInZone = getCurrentTimeInTimezone(notificationTimeZone);
    
    console.log(`Current time in ${notificationTimeZone}:`, currentTimeInZone.toLocaleString());
    
    // Create target time for today in the notification's timezone
    let nextTrigger = createDateInTimezone(notificationTimeZone, notification.time);
    
    console.log(`Target time for today:`, nextTrigger.toLocaleString());
    
    // If we have a last triggered time, check if we should skip based on frequency
    if (lastTriggered) {
      const daysSinceLastTrigger = Math.floor((Date.now() - lastTriggered.getTime()) / (1000 * 60 * 60 * 24));
      const requiredInterval = notification.frequency === 'daily' ? 1 : 2;
      
      if (daysSinceLastTrigger < requiredInterval) {
        // Not yet time for next trigger based on frequency
        const nextDate = new Date(lastTriggered);
        nextDate.setDate(nextDate.getDate() + requiredInterval);
        nextTrigger = createDateInTimezone(notificationTimeZone, notification.time, nextDate);
        console.log(`Next trigger based on frequency (${requiredInterval} days):`, nextTrigger.toLocaleString());
      }
    }
    
    // If the time has already passed today, schedule for tomorrow
    if (nextTrigger <= new Date()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextTrigger = createDateInTimezone(notificationTimeZone, notification.time, tomorrow);
      console.log(`Time passed today, scheduling for tomorrow:`, nextTrigger.toLocaleString());
    }
    
    return nextTrigger;
  };

  // Function to schedule notification
  const scheduleNotification = (notification: WhatsAppNotification) => {
    const nextTriggerTime = calculateNextTriggerTime(notification);
    const delay = nextTriggerTime.getTime() - Date.now();

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        console.log(`Triggering notification for ${notification.id} at ${new Date().toLocaleString()}`);
        
        // Trigger the notification
        triggerNotification(notification.restaurantId, notification.sectionId);
        
        // Update the last triggered time (you might want to store this in your backend)
        // For now, we'll just schedule the next occurrence
        setTimeout(() => {
          scheduleNotification(notification);
        }, 1000); // Small delay to avoid immediate rescheduling
        
      }, delay);
      
      // Store timeout ID for cleanup
      timeoutRefs.current.set(notification.id, timeoutId);
      
      const timeZoneLabel = CANADIAN_TIME_ZONES.find(tz => tz.value === (notification.timeZone || 'America/Toronto'))?.label || 'Eastern Time';
      console.log(`Notification ${notification.id} scheduled for ${nextTriggerTime.toLocaleString()} (${timeZoneLabel})`);
      
    } else {
      console.log(`Invalid delay (${delay}ms) for notification ${notification.id}`);
    }
  };

  // Function to clear scheduled notification
  const clearScheduledNotification = (notificationId: string) => {
    const timeoutId = timeoutRefs.current.get(notificationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(notificationId);
      console.log(`Cleared scheduled notification: ${notificationId}`);
    }
  };

  const fetchNotification = async () => {
    try {
      const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/data/getnotification`, {
        withCredentials: true,
      });
      const allNotification = resp.data.allNotification;
      setNotifications(allNotification);
    } catch (error) {
      console.log(error);
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

    const newNotification: WhatsAppNotification = {
      id: `notification-${Date.now()}`,
      ...formData,
      isActive: true,
    };

    try {
      const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/data/notification`, newNotification, {
        withCredentials: true,
      });
      const allNotification = resp.data.allNotification;
      
      if (resp.data.success) {
        setNotifications(allNotification);
        const timeZoneLabel = CANADIAN_TIME_ZONES.find(tz => tz.value === formData.timeZone)?.label || 'Selected Time Zone';
        toast.success(`New Notification Added for ${timeZoneLabel}!`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        toast.error(resp.data.message, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error('Something went wrong', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
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
      // Clear the scheduled notification
      clearScheduledNotification(id);
      setNotifications(notifications.filter(notification => notification.id !== id));
    }
  };

  // Effect to schedule notifications when notifications change
  useEffect(() => {
    console.log('Scheduling notifications, count:', notifications.length);
    
    // Clear all existing timeouts
    timeoutRefs.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutRefs.current.clear();

    // Schedule all active notifications
    notifications.forEach(notification => {
      if (notification.isActive) {
        scheduleNotification(notification);
      }
    });

    // Cleanup function
    return () => {
      timeoutRefs.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutRefs.current.clear();
    };
  }, [notifications]);

  useEffect(() => {
    fetchNotification();
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
        <h2 className="text-2xl font-bold text-gray-900">WhatsApp Messages</h2>
        <Button icon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
          Create Message
        </Button>
      </div>

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
        <>
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
        </>
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
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">
                                {section?.name}
                              </h3>
                              <Badge variant="success">
                                Scheduled
                              </Badge>
                            </div>
                            
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
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
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
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