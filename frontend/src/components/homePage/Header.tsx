import React from 'react';
import logo from '../../assets/heyopey-ikkienbv.jpg'
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Heyopey.ai - Ops. On Demand." 
              className="h-12 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
           <a href='/register'>
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
             Login
            </button>
            </a>
            <a 
              href="https://calendly.com/d/cj7-hm9-t8q/product-overview-and-demo-meeting?month=2025-10" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Book a Demo
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <div className="flex flex-col space-y-2 pt-4">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-left">
                 Login
                </button>
                <a 
                  href="https://calendly.com/d/cj7-hm9-t8q/product-overview-and-demo-meeting?month=2025-10" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                >
                  Book a Demo
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;