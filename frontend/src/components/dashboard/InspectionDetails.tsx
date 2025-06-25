import React, { useState } from 'react';
import { X, Check, AlertTriangle, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Inspection, Section } from '../../types';
import { useDashboard } from '../../contexts/DashboardContext';

interface InspectionDetailsProps {
  inspection: Inspection;
  section: Section;
  onClose: () => void;
}

interface QuestionFormData {
  text: string;
  idealAnswer: boolean;
}

export const InspectionDetails = ({ inspection, section, onClose }: InspectionDetailsProps) => {
  const { updateQuestion } = useDashboard();
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
    text: '',
    idealAnswer: true,
  });

  // Function to start editing a question
  const startEditingQuestion = (question: any) => {
    setEditingQuestion(question.id);
    setQuestionFormData({
      text: question.text,
      idealAnswer: question.idealAnswer,
    });
    setShowQuestionForm(true);
  };

  // Function to handle editing questions
  const handleEditQuestion = async () => {
    if (!questionFormData.text.trim() || !editingQuestion) return;

    try {
      await updateQuestion(section.id, editingQuestion, questionFormData);
      setQuestionFormData({ text: '', idealAnswer: true });
      setEditingQuestion(null);
      setShowQuestionForm(false);
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

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
                  
                    const isPassed = response.passed;
                    
                    return (
                      <div 
                        key={response.questionId}
                        className="p-4 bg-gray-50 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{question_sec.text}</p>
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge 
                                variant={isPassed ? 'success' : 'warning'}
                                className="flex items-center"
                              >
                                {isPassed ? (
                                  <Check size={14} className="mr-1" />
                                ) : (
                                  <AlertTriangle size={14} className="mr-1" />
                                )}
                                {isPassed ? 'Passed' : 'Needs Attention'}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Edit Button for Question
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingQuestion(question_sec)}
                            icon={<Edit size={16} />}
                            className="text-primary hover:text-primary ml-2"
                          >
                            Edit Question
                          </Button> */}
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

      {/* Edit Question Form Modal */}
      {showQuestionForm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-60"
            onClick={() => {
              setShowQuestionForm(false);
              setEditingQuestion(null);
              setQuestionFormData({ text: '', idealAnswer: true });
            }}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-70">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Inspection Point
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setEditingQuestion(null);
                    setQuestionFormData({ text: '', idealAnswer: true });
                  }}
                  icon={<X size={16} />}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={4}
                      value={questionFormData.text}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, text: e.target.value })}
                      placeholder="Enter the inspection question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ideal Answer
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="yes-edit"
                          checked={questionFormData.idealAnswer === true}
                          onChange={() => setQuestionFormData({ ...questionFormData, idealAnswer: true })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="yes-edit" className="ml-2 text-sm text-gray-700">
                          "Yes" passes the inspection
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="no-edit"
                          checked={questionFormData.idealAnswer === false}
                          onChange={() => setQuestionFormData({ ...questionFormData, idealAnswer: false })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="no-edit" className="ml-2 text-sm text-gray-700">
                          "No" passes the inspection
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestion(null);
                      setQuestionFormData({ text: '', idealAnswer: true });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditQuestion}>
                    Update Question
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};