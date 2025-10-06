import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

interface RestaurantCardProps {
  id: string;
  name: string;
  location: string;
  image: FileList;
  status: 'passed' | 'failed' | 'attention' | 'process'
}

export const RestaurantCard = ({ id, name, location, image,status }: RestaurantCardProps) => {
  const navigate = useNavigate();
  console.log(`${import.meta.env.VITE_BACKEND_URL}${image}`)
  
  const handleClick = () => {
    navigate(`/restaurants/${id}`);
  };
  
  return (
    <Card 
      className="h-full overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="h-44 overflow-hidden">
        <img 
          src={`${import.meta.env.VITE_BACKEND_URL}${image}`}
          crossOrigin="anonymous" 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
          <span className="truncate">Meta Approval Status:</span>
          <StatusBadge status={status} className="mr-1 flex-shrink-0" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={16} className="mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center justify-end text-primary-600 text-sm font-medium">
          View Details
          <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
};