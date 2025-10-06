import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useDashboard } from '../../contexts/DashboardContext';

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    whatsappNumber: string;
    restaurantId: string;
    sectionIds: string[];
  };
  title: string;
}

export interface EmployeeFormData {
  name: string;
  whatsappNumber: string;
  restaurantId: string;
  sectionIds: string[];
}

export const EmployeeForm = ({ onSubmit, onCancel, initialData, title }: EmployeeFormProps) => {
  const { restaurants, sections } = useDashboard();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EmployeeFormData>({
    defaultValues: initialData || {
      name: '',
      whatsappNumber: '',
      restaurantId: '',
      sectionIds: [],
    }
  });

  const selectedRestaurantId = watch('restaurantId');
  const availableSections = sections.filter(section => section.restaurantId === selectedRestaurantId);
  const selectedSections = watch('sectionIds') || [];

  const handleSectionToggle = (sectionId: string) => {
    const currentSections = selectedSections;
    const newSections = currentSections.includes(sectionId)
      ? currentSections.filter(id => id !== sectionId)
      : [...currentSections, sectionId];
    setValue('sectionIds', newSections);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Employee Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Employee name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter employee name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                id="whatsappNumber"
                type="text"
                {...register('whatsappNumber', { 
                  required: 'WhatsApp number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+1234567890"
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-sm text-danger">{errors.whatsappNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant
              </label>
              <select
                id="restaurantId"
                {...register('restaurantId', { required: 'Please select a restaurant' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a restaurant</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              {errors.restaurantId && (
                <p className="mt-1 text-sm text-danger">{errors.restaurantId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsible Sections
              </label>
              <div className="space-y-2 border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto">
                {selectedRestaurantId ? (
                  availableSections.length > 0 ? (
                    availableSections.map(section => (
                      <label
                        key={section.id}
                        className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedSections.includes(section.id)}
                          onChange={() => handleSectionToggle(section.id)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{section.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-2">No sections available for this restaurant</p>
                  )
                ) : (
                  <p className="text-sm text-gray-500 p-2">Select a restaurant to view available sections</p>
                )}
              </div>
              {errors.sectionIds && (
                <p className="mt-1 text-sm text-danger">{errors.sectionIds.message}</p>
              )}
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>
              {initialData ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};