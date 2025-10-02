import React from 'react';
import { BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const DashboardShowcase = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Your Restaurant Compliance, At a Glance
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Heyopey.ai gives managers a detailed dashboard of inspections, with clear highlights of where attention is needed. Get visibility, accountability, and peace of mind.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <span className="text-gray-700">Real-time inspection status</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                <span className="text-gray-700">Compliance analytics and trends</span>
              </div>
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
                <span className="text-gray-700">Automated alerts for issues</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Restaurant Dashboard</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-green-700">Compliance Rate</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-700">Completed Today</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-sm text-orange-700">Need Attention</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Kitchen Inspection</span>
                    </div>
                    <span className="text-xs text-green-600">Completed</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Dining Area Check</span>
                    </div>
                    <span className="text-xs text-orange-600">Overdue</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Storage Audit</span>
                    </div>
                    <span className="text-xs text-blue-600">In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcase;