import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { useAuth, PERMISSIONS } from '../contexts/AuthContext';
import { RestaurantCard } from '../components/restaurants/RestaurantCard';
import { RestaurantForm, RestaurantFormData } from '../components/restaurants/RestaurantForm';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const Restaurants = () => {
  const { restaurants, addRestaurant } = useDashboard();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRestaurant = (data: RestaurantFormData) => {
    addRestaurant(data);
    setShowAddForm(false);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Restaurants</h2>
        {hasPermission(PERMISSIONS.ADD_RESTAURANT) && (
          <Button icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
            Add Restaurant
          </Button>
        )}
      </div>
      
      {/* Search box */}
      <Card className="bg-white shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search restaurants by name or location..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Restaurant Form Slider */}
      {showAddForm && (
        <div className='h-[100%]'>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => setShowAddForm(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 animate-slide-in-right">
            <RestaurantForm
              onSubmit={handleAddRestaurant}
              onCancel={() => setShowAddForm(false)}
              title="Add New Restaurant"
            />
          </div>
        </div>
      )}
      
      {/* Restaurant Grid */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              status={restaurant.status}
              name={restaurant.name}
              location={restaurant.location}
              image={restaurant.image}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No restaurants found.</p>
          {restaurants.length > 0 && searchTerm && (
            <p className="text-gray-500 mt-2">
              Try adjusting your search criteria.
            </p>
          )}
          {restaurants.length === 0 && (
            <div className="mt-4">
              {hasPermission(PERMISSIONS.ADD_RESTAURANT) && (
                <Button icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
                  Add Your First Restaurant
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Restaurants;