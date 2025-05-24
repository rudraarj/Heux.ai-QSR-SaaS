import React, { useState } from 'react';
import { Plus, Bell, Clock, Calendar, X, Power, Trash2 } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { WhatsAppNotification } from '../types';

interface NotificationFormData {
  restaurantId: string;
  sectionId: string;
  frequency: 'daily' | 'alternate';
  time: string;
}

const Notifications = () => {
  const { restaurants, sections } = useDashboard();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [formData, setFormData] = useState<NotificationFormData>({
    restaurantId: '',
    sectionId: '',
    frequency: 'daily',
    time: '09:00',
  });

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotification: WhatsAppNotification = {
      id: `notification-${Date.now()}`,
      ...formData,
      isActive: true,
    };
    setNotifications([...notifications, newNotification]);
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

  // Group notifications by restaurant
  const notificationsByRestaurant = restaurants.reduce((acc, restaurant) => {
    acc[restaurant.id] = notifications.filter(n => n.restaurantId === restaurant.id);
    return acc;
  }, {} as Record<string, WhatsAppNotification[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">WhatsApp Notifications</h2>
        <Button icon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
          Create Notification
        </Button>
      </div>

      {/* Create Notification Form */}
      {showCreateForm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 animate-slide-in-right">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create Notification</h2>
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
                    Create Notification
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notifications by Restaurant */}
      <div className="space-y-6">
        {restaurants.map(restaurant => {
          const restaurantNotifications = notificationsByRestaurant[restaurant.id] || [];
          
          if (restaurantNotifications.length === 0) return null;
          
          return (
            <Card key={restaurant.id}>
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
                            <Bell size={20} className="text-primary-600" />
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

        {notifications.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No notifications configured.</p>
            <div className="mt-4">
              <Button icon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
                Create Your First Notification
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;