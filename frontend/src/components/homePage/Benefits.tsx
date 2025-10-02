import React from 'react';
import { Zap, Shield, Users, Eye } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Zap,
      title: "Efficiency",
      description: "Save time by automating inspections and reminders.",
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Compliance",
      description: "Ensure SOPs are consistently followed across all stations.",
      color: "green"
    },
    {
      icon: Users,
      title: "Accountability",
      description: "Employees are notified at the right time, so nothing slips.",
      color: "blue"
    },
    {
      icon: Eye,
      title: "Visibility",
      description: "Managers get a clear, actionable dashboard of inspection data.",
      color: "purple"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Heyopey.ai
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your restaurant operations with these key benefits
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow text-center">
              <div className={`bg-${benefit.color}-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto`}>
                <benefit.icon className={`w-8 h-8 text-${benefit.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;