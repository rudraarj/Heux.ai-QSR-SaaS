import React from 'react';
import { FileText, MessageSquare, Bell } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "Standardize SOPs",
      description: "Upload and manage your SOPs so every station follows the same process.",
      color: "blue"
    },
    {
      icon: MessageSquare,
      title: "Automate Inspections via WhatsApp",
      description: "Employees get guided checklists directly in WhatsApp to complete inspections.",
      color: "green"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Heyopey.ai notifies the right employee at the right time to ensure inspections happen.",
      color: "purple"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Heyopey.ai Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to transform your restaurant operations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className={`bg-${step.color}-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-t-transparent border-b-2 border-b-transparent absolute right-0 top-1/2 transform -translate-y-1/2"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;