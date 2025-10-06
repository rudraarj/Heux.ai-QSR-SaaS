import React from 'react';
import { MessageSquare, Users, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Keep Your Restaurant SOPs on Track with{' '}
              <span className="text-green-600">Opey AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Standardize your processes, automate inspections, and get real-time insights—all in one simple platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://calendly.com/d/cj7-hm9-t8q/product-overview-and-demo-meeting?month=2025-10" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl text-center"
              >
                Book a Demo
              </a>
              <a href='/register'>
             <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold text-lg">
               Login
             </button>
             </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center mb-6">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <span className="text-lg font-semibold text-gray-900">Restaurant Staff</span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">WhatsApp Notification</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    "Time for kitchen inspection! Complete your checklist now."
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Inspection Complete</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    "Kitchen inspection completed successfully ✓"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;