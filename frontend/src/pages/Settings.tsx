import React from 'react';
import { Save, Bell, MessageSquare, Shield, UserCog } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Settings Menu</h3>
            </div>
            <div className="p-2">
              <button className="w-full flex items-center px-4 py-3 text-left rounded-lg bg-primary-50 text-primary-700">
                <UserCog size={18} className="mr-3" />
                <span className="font-medium">Account Settings</span>
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-50">
                <Bell size={18} className="mr-3" />
                <span className="font-medium">Notifications</span>
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-50">
                <MessageSquare size={18} className="mr-3" />
                <span className="font-medium">WhatsApp Integration</span>
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-50">
                <Shield size={18} className="mr-3" />
                <span className="font-medium">Privacy & Security</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your Company, Inc."
                />
              </div>
              
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Account Preferences
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="email-notifications"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="email-notifications" className="ml-3 text-sm text-gray-700">
                      Email notifications for completed inspections
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="weekly-summary"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="weekly-summary" className="ml-3 text-sm text-gray-700">
                      Receive weekly inspection summary reports
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="failed-inspections"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="failed-inspections" className="ml-3 text-sm text-gray-700">
                      Immediate alerts for failed inspections
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button icon={<Save size={16} />}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;