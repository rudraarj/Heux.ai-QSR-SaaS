import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface SectionFormProps {
  onSubmit: (data: SectionFormData) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
  };
  title: string;
}

export interface SectionFormData {
  name: string;
}

export const SectionForm = ({ onSubmit, onCancel, initialData, title }: SectionFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SectionFormData>({
    defaultValues: initialData || {
      name: '',
    }
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500"
          onClick={onCancel}
          icon={<X size={16} />}
        />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Section Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Section name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter section name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update Section' : 'Add Section'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};