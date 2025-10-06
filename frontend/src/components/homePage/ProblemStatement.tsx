import React from 'react';
import { AlertTriangle, Eye, FileX, TrendingDown } from 'lucide-react';

const ProblemStatement = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Running a restaurant is tough when SOPs aren't followed",
      description: "Inconsistent processes lead to quality issues and customer complaints"
    },
    {
      icon: Eye,
      title: "Managers can't be everywhere at once",
      description: "Limited oversight means problems go unnoticed until it's too late"
    },
    {
      icon: FileX,
      title: "Inspections often get skipped or poorly documented",
      description: "Manual processes are unreliable and create compliance gaps"
    },
    {
      icon: TrendingDown,
      title: "Small compliance gaps lead to bigger problems",
      description: "Minor issues compound into major quality and service failures"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Restaurant Management Challenges
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every restaurant faces these critical operational challenges that impact quality and profitability
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-red-50 border border-red-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start">
                <div className="bg-red-100 rounded-lg p-3 mr-4">
                  <problem.icon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-gray-600">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;