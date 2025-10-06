import React from 'react';

const StickyCTA = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between">
        <span className="font-semibold">Ready to get started?</span>
        <a 
          href="https://calendly.com/d/cj7-hm9-t8q/product-overview-and-demo-meeting?month=2025-10" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-green-600 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100 transition-colors"
        >
          Book Demo
        </a>
      </div>
    </div>
  );
};

export default StickyCTA;