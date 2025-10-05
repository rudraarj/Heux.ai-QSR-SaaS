import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Clock, Calendar, X, Power, Trash2, Filter } from 'lucide-react';
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
}

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
  });

  const fetchNotification = async () =>{
    try {
      const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/data/getnotification`,
        {
          withCredentials: true,  // Correct option to include cookies
        });
      const allNotification = resp.data.allNotification
      setNotifications(allNotification)
    } catch (error) {
      console.log(error);
    }
  }

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
  if (!formData.restaurantId || !formData.sectionId || !formData.frequency || !formData.time) {
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
      const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/data/notification`,newNotification,
        {
          withCredentials: true,  // Correct option to include cookies
        });
      const allNotification = resp.data.allNotification
      if(resp.data.success){
        setNotifications(allNotification);
        toast.success('New Notification Added!', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      }else{
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
      toast.error('something want wrong', {
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
    });
  };

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, isActive: !notification.isActive }
        : notification
    ));
  };

  const deleteNotification = (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(notification => notification.id !== id));
    }
  };

  useEffect(()=>{
    fetchNotification()
  },[notifications])


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
                      Time
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
                              <Badge variant={notification.isActive ? 'success' : 'outline'}>
                                {notification.isActive ? 'Active' : 'Inactive'}
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
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleNotification(notification.id)}
                            icon={<Power size={16} />}
                            className={notification.isActive ? 'text-success' : 'text-gray-400'}
                          >
                            {notification.isActive ? 'Active' : 'Inactive'}
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