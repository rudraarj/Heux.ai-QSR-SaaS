import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface RestaurantFormProps {
  onSubmit: (data: RestaurantFormData) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    location: string;
    image: FileList;
  };
  title: string;
}

export interface RestaurantFormData {
  name: string;
  location: string;
  image: FileList; // changed from string to FileList
  status: 'passed' | 'failed' | 'attention' | 'process';
}

export const RestaurantForm = ({ onSubmit, onCancel, initialData, title }: RestaurantFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RestaurantFormData>({
    defaultValues: initialData
    ? {
        name: initialData.name,
        location: initialData.location,
        image: undefined, // ✅ FIX: use undefined
      }
    : {
        name: '',
        location: '',
        image: undefined, // ✅ FIX: use undefined
      }
  });

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Restaurant name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter restaurant name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="location"
              type="text"
              {...register('location', { required: 'Location is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter location"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-danger">{errors.location.message}</p>
            )}
          </div>
          <div>
  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
    Upload Image (&lt;1MB)
  </label>
  <input
    id="image"
    type="file"
    accept="image/*"
    {...register('image', { required: 'Image is required' })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  {errors.image && (
    <p className="mt-1 text-sm text-danger">{errors.image.message}</p>
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
            {initialData ? 'Update Restaurant' : 'Add Restaurant'}
          </Button>
        </div>
      </div>
    </div>
  );
};