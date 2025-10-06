import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Layers } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { useAuth, PERMISSIONS } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { EmployeeForm, EmployeeFormData } from '../components/employees/EmployeeForm';

const Employees =() => {
  const { employees, restaurants, sections, addEmployee, updateEmployee, deleteEmployee } = useDashboard();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = (
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.whatsappNumber.includes(searchTerm)
    );
    const matchesRestaurant = selectedRestaurant === 'all' || employee.restaurantId === selectedRestaurant;
    const matchesSection = selectedSection === 'all' || employee.sectionIds.includes(selectedSection);
    
    return matchesSearch && matchesRestaurant && matchesSection;
  });
  
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

  const handleAddEmployee = (data: EmployeeFormData) => {
    const newEmployee = {
      ...data,
      employeeId: `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      image: 'https://img.freepik.com/premium-vector/avatar-guest-vector-icon-illustration_1304166-97.jpg?semt=ais_hybrid&w=740'
    };
    addEmployee(newEmployee);
    setShowAddForm(false);
  };

  const handleEditEmployee = (id: string, data: EmployeeFormData) => {
    updateEmployee(id, data);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  // Get available sections based on selected restaurant
  const availableSections = selectedRestaurant === 'all' 
    ? sections 
    : sections.filter(section => section.restaurantId === selectedRestaurant);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and filter */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center flex-1">
                <Filter size={16} className="text-gray-500 mr-2" />
                <select
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                  value={selectedRestaurant}
                  onChange={(e) => {
                    setSelectedRestaurant(e.target.value);
                    setSelectedSection('all'); // Reset section when restaurant changes
                  }}
                >
                  <option value="all">All Restaurants</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center flex-1">
                <select
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={selectedRestaurant === 'all'}
                >
                  <option value="all">All Sections</option>
                  {availableSections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {hasPermission(PERMISSIONS.ADD_EMPLOYEE) && (
                <Button 
                  icon={<Plus size={16} />}
                  onClick={() => setShowAddForm(true)}
                >
                  Add Employee
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Employee Form */}
      {(showAddForm || editingEmployee) && (
        <div className='h-[100%]'>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => {
              setShowAddForm(false);
              setEditingEmployee(null);
            }}
          />
          <div className={`fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${(showAddForm || editingEmployee) ? 'translate-x-0' : 'translate-x-full'}`}>
            <EmployeeForm
              onSubmit={editingEmployee ? 
                (data) => handleEditEmployee(editingEmployee, data) : 
                handleAddEmployee
              }
              onCancel={() => {
                setShowAddForm(false);
                setEditingEmployee(null);
              }}
              initialData={editingEmployee ? {
                name: employees.find(e => e.id === editingEmployee)?.name || '',
                whatsappNumber: employees.find(e => e.id === editingEmployee)?.whatsappNumber || '',
                restaurantId: employees.find(e => e.id === editingEmployee)?.restaurantId || '',
                sectionIds: employees.find(e => e.id === editingEmployee)?.sectionIds || [],
              } : undefined}
              title={editingEmployee ? "Edit Employee" : "Add New Employee"}
            />
          </div>
        </div>
      )}
      
      {/* Employees list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEmployees.map(employee => (
          <Card 
            key={employee.id} 
            className="overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar 
                    src={employee.image} 
                    name={employee.name} 
                    size="lg" 
                  />
                  <div>
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
                        <Layers size={16} className="mr-1.5 mt-1 text-gray-400 flex-shrink-0" />
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
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingEmployee(employee.id)}
                    icon={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    icon={<Trash2 size={16} />}
                    className="text-danger hover:text-danger"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No employees found.</p>
            {searchTerm || selectedRestaurant !== 'all' || selectedSection !== 'all' ? (
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filter criteria.
              </p>
            ) : (
              <div className="mt-4">
                {hasPermission(PERMISSIONS.ADD_EMPLOYEE) && (
                  <Button icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
                    Add Your First Employee
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;