import React, { useState, useRef } from 'react';
import { User, Mail, Camera, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import person from '../../assets/person.jpg'

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileMenu = ({ isOpen, onClose }: ProfileMenuProps) => {
    const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>("https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const logout = async ()=>{
    try {
        const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/auth/logout`,{},
          {
            withCredentials: true,
          });
          if (resp.data.success) {
                  toast.success('You are logout successfully', {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  });
                  navigate('/register');
                } else {
                  toast.error(resp.data.message || 'Something went wrong', {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  });
                }
              } catch (error: any) {            
                const message =
                  "Unknown error occurred";
            
                toast.error(message, {
                  position: "bottom-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
              }
            };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-16 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                <img 
                  src={person} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} className="text-gray-600" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Test Account</h3>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-2">
          <div className="space-y-1">
            {/* <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              icon={<User size={16} />}
            >
              Account Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              icon={<Mail size={16} />}
            >
              Update Email
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-danger hover:text-danger"
              icon={<LogOut size={16} />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};