import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  QrCode,
  MessageSquare,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
<<<<<<< HEAD
import image from '../../assets/logo.jpg'
=======
import image from '../../assets/heyopey.jpg'
>>>>>>> 825a50fdf62bfa628f02eca0eede0b10052e9c61

const navItems = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/restaurants', label: 'Restaurants', icon: <Store size={20} /> },
  { path: '/employees', label: 'Employees', icon: <Users size={20} /> },
  { path: '/qr-codes', label: 'QR Codes', icon: <QrCode size={20} /> },
  { path: '/whatsapp-messages', label: 'WhatsApp Messages', icon: <MessageSquare size={20} /> },
<<<<<<< HEAD
  { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
=======
  // { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
>>>>>>> 825a50fdf62bfa628f02eca0eede0b10052e9c61
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-white p-1.5 rounded">
            <img className='w-10' src={image} alt="logo" />
          </div>
          <span className="text-xl font-bold text-gray-900">HEYOPIE</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={20} />}
            onClick={onClose}
            className="lg:hidden"
          />
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors min-h-touch',
                isActive
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
              )
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};