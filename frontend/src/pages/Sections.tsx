import React from 'react';
import { useState } from 'react';
import { Plus, ChevronRight, Clock, Filter } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const Sections = () => {
  const { sections, restaurants } = useDashboard();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  
  // Filter sections based on selected restaurant
  const filteredSections = selectedRestaurant === 'all'
    ? sections
    : sections.filter(section => section.restaurantId === selectedRestaurant);
  
  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Unknown Restaurant';
  };
  
  const getFrequencyLabel = (section: any) => {
    switch(section.frequency) {
      case 'daily':
        return 'Daily';
      case 'twice-daily':
        return 'Twice Daily';
      case 'custom':
        return `${section.customTimes?.length || 0} Custom Times`;
      default:
        return 'Custom';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sections</h2>
        <Button icon={<Plus size={16} />}>
          Add Section
        </Button>
      </div>
      
      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Filter size={16} className="text-gray-500 mr-2" />
            <label htmlFor="restaurant-filter" className="block font-medium text-gray-700 mr-3">
              Filter by Restaurant:
            </label>
            <select
              id="restaurant-filter"
              className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="all">All Restaurants</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
      
      {/* Sections */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSections.length > 0 ? (
          filteredSections.map(section => (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gray-50 py-4">
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <Badge variant="outline">
                  {getRestaurantName(section.restaurantId)}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock size={18} className="text-gray-400 mr-2" />
                    <span className="text-sm font-medium">Inspection Frequency:</span>
                  </div>
                  <Badge className="capitalize">
                    {getFrequencyLabel(section)}
                  </Badge>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Questions</h4>
                  <ul className="space-y-2">
                    {section.questions.map(question => (
                      <li key={question.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                        {question.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <div className="p-4 bg-gray-50 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-600"
                  iconPosition="end"
                  icon={<ChevronRight size={16} />}
                >
                  Edit Section
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No sections found.</p>
            {selectedRestaurant !== 'all' && (
              <p className="text-gray-500 mt-2">
                Try selecting a different restaurant or add sections to this restaurant.
              </p>
            )}
            <div className="mt-4">
              <Button icon={<Plus size={16} />}>
                Add Section
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sections;