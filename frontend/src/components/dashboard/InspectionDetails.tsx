import React from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Inspection, Section } from '../../types';

interface InspectionDetailsProps {
  inspection: Inspection;
  section: Section;
  onClose: () => void;
}

export const InspectionDetails = ({ inspection, section, onClose }: InspectionDetailsProps) => {
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Inspection Details</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500"
              onClick={onClose}
              icon={<X size={16} />}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <Badge 
                  variant={inspection.status === 'passed' ? 'success' : 'warning'}
                  className="text-sm"
                >
                  {inspection.status === 'passed' ? 'Passed' : 'Needs Attention'}
                </Badge>
              </div>

              {/* Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Section</h3>
                <p className="text-gray-900 font-medium">{section.name}</p>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Inspection Time</h3>
                <p className="text-gray-900">
                  {new Date(inspection.date).toLocaleString()}
                </p>
              </div>

              {/* Inspection Points */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Inspection Points</h3>
                <div className="space-y-4">
                  {inspection.responses.map((response, index) => {
                    const question_sec = section.questions.find(q => q.id === response.questionId);
                    if (!question_sec) return null;

                    const question = section.questions.find(q => q.id === response.questionId);
                    if (!question) return null;
                  
                    const isPassed = response.passed
                    return (
                      <div 
                        key={response.questionId}
                        className="p-4 bg-gray-50 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-gray-900 font-medium">{question_sec.text}</p>
                          <Badge 
                            variant={isPassed ? 'success' : 'warning'}
                            className="ml-2 flex items-center"
                          >
                            {isPassed ? (
                              <Check size={14} className="mr-1" />
                            ) : (
                              <AlertTriangle size={14} className="mr-1" />
                            )}
                            {isPassed ? 'Passed' : 'Needs Attention'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium mr-2">Answer:</span>
                          {response.passed ? 'Yes' : 'No'}
                        </div>

                        {response.comment && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-500">Comment:</span>
                            <p className="mt-1 text-gray-700">{response.comment}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Media */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Media</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Example media items - replace with actual media from your data */}
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500">No media available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};