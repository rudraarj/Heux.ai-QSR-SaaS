import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Plus, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProfileMenu } from './ProfileMenu';

const pathToTitle: Record<string, string> = {
  '/': 'Dashboard',
  '/restaurants': 'Restaurants',
  '/sections': 'Sections',
  '/employees': 'Employees',
  '/qr-codes': 'QR Codes',
  '/settings': 'Settings',
};

export const Header = () => {
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const title = pathToTitle[location.pathname] || 'Dashboard';
  

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 ml-12 lg:ml-0">{title}</h1>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full relative min-h-touch">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
            </button>
            
            <div className="relative">
              <button 
                className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden hover:ring-2 hover:ring-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <img 
                  src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </button>
              
              <ProfileMenu 
                isOpen={isProfileMenuOpen} 
                onClose={() => setIsProfileMenuOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};