import React from 'react';
import { ArrowRight } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Run Your Restaurant the Smarter Way
        </h2>
        <p className="text-xl text-green-100 mb-8 leading-relaxed">
          Automated inspections, real-time dashboards, and full SOP compliance—all with Heyopey.ai.
        </p>
        <a 
          href="https://calendly.com/d/cj7-hm9-t8q/product-overview-and-demo-meeting?month=2025-10" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl inline-flex items-center"
        >
          Book a Demo Today
          <ArrowRight className="w-5 h-5 ml-2" />
        </a>
      </div>
    </section>
  );
};

export default FinalCTA;