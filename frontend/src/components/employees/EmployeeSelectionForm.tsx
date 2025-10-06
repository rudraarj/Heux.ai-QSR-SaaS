import React, { useState } from 'react';
import { Search, X, Check, Users, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useDashboard } from '../../contexts/DashboardContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface EmployeeSelectionFormProps {
  restaurantId: string;
  onSubmit: (selectedEmployeeIds: string[]) => void;
  onCancel: () => void;
  title: string;
}

export const EmployeeSelectionForm: React.FC<EmployeeSelectionFormProps> = ({
  restaurantId,
  onSubmit,
  onCancel,
  title
}) => {
  const { employees, restaurants, sections, updateEmployee } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter out employees who are already assigned to this restaurant
  const availableEmployees = employees.filter(employee => 
    employee.restaurantId !== restaurantId &&
    (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employee.whatsappNumber.includes(searchTerm))
  );

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Unknown Restaurant';
  };

  const getSectionNames = (sectionIds: string[]) => {
    return sectionIds.map(id => {
      const section = sections.find(s => s.id === id);
      return section ? section.name : 'Unknown';
    });
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async () => {
    if (selectedEmployeeIds.length === 0) {
      toast.warning('Please select at least one employee', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call the new API endpoint for bulk employee assignment
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}api/data/assign-employees`,
        {
          employeeIds: selectedEmployeeIds,
          restaurantId: restaurantId
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update each selected employee's restaurant assignment in local state
        selectedEmployeeIds.forEach((employeeId) => {
          const employee = employees.find(e => e.id === employeeId);
          if (employee) {
            const updatedEmployee = {
              ...employee,
              restaurantId: restaurantId
            };
            updateEmployee(employeeId, updatedEmployee);
          }
        });

        toast.success(response.data.message, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        onSubmit(selectedEmployeeIds);
      } else {
        throw new Error(response.data.message || 'Failed to assign employees');
      }
    } catch (error: any) {
      console.error('Error assigning employees:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to assign employees. Please try again.';
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500"
          onClick={onCancel}
          icon={<X size={16} />}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees by name, ID, or WhatsApp number..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Selected Count */}
          {selectedEmployeeIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedEmployeeIds.length} employee(s) selected
                </span>
              </div>
            </div>
          )}

          {/* Employee List */}
          <div className="space-y-3">
            {availableEmployees.length > 0 ? (
              availableEmployees.map(employee => (
                <Card 
                  key={employee.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedEmployeeIds.includes(employee.id) 
                      ? 'ring-2 ring-primary-500 bg-primary-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleEmployeeToggle(employee.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar 
                            src={employee.image} 
                            name={employee.name} 
                            size="md"
                          />
                          {selectedEmployeeIds.includes(employee.id) && (
                            <div className="absolute -top-1 -right-1 bg-primary-600 rounded-full p-1">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {employee.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {employee.employeeId}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 space-y-1.5">
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin size={16} className="mr-1.5 text-gray-400" />
                              {getRestaurantName(employee.restaurantId)}
                            </p>
                            
                            <div className="flex items-start">
                              <Users size={16} className="mr-1.5 mt-1 text-gray-400 flex-shrink-0" />
                              <div className="flex flex-wrap gap-1.5">
                                {getSectionNames(employee.sectionIds).map((name, index) => (
                                  <Badge key={index} variant="default" className="text-xs">
                                    {name}
                                  </Badge>
                                ))}
                                {employee.sectionIds.length === 0 && (
                                  <span className="text-sm text-gray-500">No sections assigned</span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                              WhatsApp: {employee.whatsappNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.' 
                    : 'All employees are already assigned to this restaurant.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedEmployeeIds.length === 0 || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Assigning...' : `Assign ${selectedEmployeeIds.length} Employee(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionForm;
