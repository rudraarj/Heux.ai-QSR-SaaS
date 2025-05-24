import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, Layers, QrCode, Plus, X, Check, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { RestaurantForm, RestaurantFormData } from '../components/restaurants/RestaurantForm';
import { SectionForm, SectionFormData } from '../components/sections/SectionForm';
import { EmployeeForm, EmployeeFormData } from '../components/employees/EmployeeForm';
import { Badge } from '../components/ui/Badge';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StatusBadge } from '../components/ui/StatusBadge';

interface QuestionFormData {
  text: string;
  idealAnswer: boolean;
}

const RestaurantDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    restaurants, 
    sections, 
    employees,
    updateRestaurant, 
    deleteRestaurant,
    addSection,
    updateSection,
    deleteSection,
    addEmployee,
    updateEmployee,
    deleteEmployee
  } = useDashboard();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
    text: '',
    idealAnswer: true,
  });
  
  const restaurant = restaurants.find(r => r.id === id);
  const restaurantSections = sections.filter(s => s.restaurantId === id);
  const restaurantEmployees = employees.filter(e => e.restaurantId === id);
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  const handleEdit = (data: RestaurantFormData) => {
    if (id) {
      updateRestaurant(id, data);
      setShowEditForm(false);
    }
  };

  const handleDelete = () => {
    if (id && window.confirm('Are you sure you want to delete this restaurant?')) {
      deleteRestaurant(id);
      navigate('/restaurants');
    }
  };

  const handleAddSection = (data: SectionFormData) => {
    if (id) {
      addSection({
        ...data,
        restaurantId: id,
        frequency: 'daily',
        questions: []
      });
      setShowAddSectionForm(false);
    }
  };

  const handleEditSection = (sectionId: string, data: SectionFormData) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      updateSection(sectionId, {
        ...section,
        ...data,
      });
    }
    setEditingSection(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      deleteSection(sectionId);
    }
  };

  const handleAddEmployee = (data: EmployeeFormData) => {
    if (id) {
      const newEmployee = {
        ...data,
        restaurantId: id,
        employeeId: `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
      addEmployee(newEmployee);
      setShowAddEmployeeForm(false);
    }
  };

  const handleEditEmployee = (employeeId: string, data: EmployeeFormData) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      updateEmployee(employeeId, {
        ...employee,
        ...data,
      });
    }
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(employeeId);
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedSectionId || !questionFormData.text.trim()) return;

    const section = sections.find(s => s.id === selectedSectionId);
    if (!section) return;

    const newQuestion = {
      id: `question-${Date.now()}`,
      text: questionFormData.text.trim(),
      sectionId: selectedSectionId,
      idealAnswer: questionFormData.idealAnswer,
    };
    try {
      const resp = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}api/data/addquestion`,newQuestion,
        {
          withCredentials: true,  // Correct option to include cookies
        });
       if(resp.data.success){
        updateSection(selectedSectionId, {
          ...section,
          questions: resp.data.questions,
        });
              toast.success('New Question Added!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
            }else{
              toast.error(resp.data.message, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
            }
          } catch (error) {
            toast.error('something want wrong', {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              });
          }
    setQuestionFormData({ text: '', idealAnswer: true });
    setShowQuestionForm(false);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    if (window.confirm('Are you sure you want to delete this question?')) {
      updateSection(sectionId, {
        ...section,
        questions: section.questions.filter(q => q.id !== questionId),
      });
    }
  };
  
  if (!restaurant) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Restaurant not found.</p>
        <Link to="/restaurants" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Go back to restaurants
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/restaurants">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
      </div>

      {showEditForm ? (
        <RestaurantForm
          onSubmit={handleEdit}
          onCancel={() => setShowEditForm(false)}
          initialData={restaurant}
          title="Edit Restaurant"
        />
      ) : showAddSectionForm ? (
        <SectionForm
          onSubmit={handleAddSection}
          onCancel={() => setShowAddSectionForm(false)}
          title="Add New Section"
        />
      ) : (
        <>
          {/* Restaurant header */}
          <div className="relative h-56 rounded-xl overflow-hidden bg-gray-200">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${restaurant.image}`}
              crossOrigin="anonymous"
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
            <div className="flex justify-between w-full absolute bottom-0 left-0 p-6">
              <div>
              <h1 className="text-white text-2xl font-bold">{restaurant.name}</h1>
              <p className="text-white/90 flex items-center">
                {restaurant.location}
              </p>
              </div>
              <div>
              <p className="text-white/90 flex items-center">
                Meta Approval Status:
              </p>
              <StatusBadge status={restaurant.status}/>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button 
                variant="outline" 
                icon={<Edit size={16} />}
                className="bg-white/90 hover:bg-white"
                onClick={() => setShowEditForm(true)}
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                icon={<Trash2 size={16} />}
                className="bg-white/90 hover:bg-white text-danger hover:text-white hover:bg-danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
          
          {/* Restaurant stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Layers className="h-6 w-6 text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Sections</p>
                    <p className="text-2xl font-semibold">{restaurantSections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-secondary-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-secondary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employees</p>
                    <p className="text-2xl font-semibold">{restaurantEmployees.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <QrCode className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">QR Codes</p>
                    <p className="text-2xl font-semibold">{restaurantSections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sections and Employees */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sections */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sections</CardTitle>
                <Button 
                  size="sm" 
                  icon={<Plus size={16} />}
                  onClick={() => setShowAddSectionForm(true)}
                >
                  Add Section
                </Button>
              </CardHeader>
              <CardContent>
                {restaurantSections.length > 0 ? (
                  <div className="space-y-3">
                    {restaurantSections.map(section => (
                      editingSection === section.id ? (
                        <SectionForm
                          key={section.id}
                          onSubmit={(data) => handleEditSection(section.id, data)}
                          onCancel={() => setEditingSection(null)}
                          initialData={{ name: section.name }}
                          title="Edit Section"
                        />
                      ) : (
                        <div 
                          key={section.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{section.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingSection(section.id)}
                              icon={<Edit size={16} />}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
                              icon={<Trash2 size={16} />}
                              className="text-danger hover:text-danger"
                            />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">No sections added yet.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Employees */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employees</CardTitle>
                <Button 
                  size="sm" 
                  icon={<Plus size={16} />}
                  onClick={() => setShowAddEmployeeForm(true)}
                >
                  Add Employee
                </Button>
              </CardHeader>
              <CardContent>
                {restaurantEmployees.length > 0 ? (
                  <div className="space-y-3">
                    {restaurantEmployees.map(employee => (
                      <div 
                        key={employee.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Avatar 
                            src={employee.image} 
                            name={employee.name} 
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500">
                              ID: {employee.employeeId} • {employee.sectionIds.length} sections
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
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
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">No employees added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inspection Points */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inspection Points</CardTitle>
              <div className="flex items-center space-x-2">
                <select
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                >
                  <option value="">Select a section</option>
                  {restaurantSections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                <Button 
                  size="sm" 
                  icon={<Plus size={16} />}
                  onClick={() => setShowQuestionForm(true)}
                  disabled={!selectedSectionId}
                >
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedSectionId ? (
                selectedSection?.questions.length ? (
                  <div className="space-y-4">
                    {selectedSection.questions.map((question) => (
                      <div 
                        key={question.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-medium text-gray-900">{question.text}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge 
                              variant={question.idealAnswer ? 'success' : 'danger'}
                              className="flex items-center space-x-1"
                            >
                              {question.idealAnswer ? (
                                <Check size={14} className="mr-1" />
                              ) : (
                                <AlertTriangle size={14} className="mr-1" />
                              )}
                              <span>Passes when answer is {question.idealAnswer ? '"Yes"' : '"No"'}</span>
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(selectedSectionId, question.id)}
                          icon={<Trash2 size={16} />}
                          className="text-danger hover:text-danger"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">
                    No inspection points added for this section yet.
                  </p>
                )
              ) : (
                <p className="text-center py-6 text-gray-500">
                  Select a section to view or add inspection points.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Employee Form */}
      {(showAddEmployeeForm || editingEmployee) && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => {
              setShowAddEmployeeForm(false);
              setEditingEmployee(null);
            }}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
            <EmployeeForm
              onSubmit={editingEmployee ? 
                (data) => handleEditEmployee(editingEmployee, data) : 
                handleAddEmployee
              }
              onCancel={() => {
                setShowAddEmployeeForm(false);
                setEditingEmployee(null);
              }}
              initialData={editingEmployee ? {
                name: employees.find(e => e.id === editingEmployee)?.name || '',
                whatsappNumber: employees.find(e => e.id === editingEmployee)?.whatsappNumber || '',
                restaurantId: id || '',
                sectionIds: employees.find(e => e.id === editingEmployee)?.sectionIds || [],
              } : {
                name: '',
                whatsappNumber: '',
                restaurantId: id || '',
                sectionIds: [],
              }}
              title={editingEmployee ? "Edit Employee" : "Add New Employee"}
            />
          </div>
        </>
      )}

      {/* Add Question Form */}
      {showQuestionForm && selectedSectionId && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => setShowQuestionForm(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add Inspection Point</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => setShowQuestionForm(false)}
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
                          id="yes"
                          checked={questionFormData.idealAnswer === true}
                          onChange={() => setQuestionFormData({ ...questionFormData, idealAnswer: true })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="yes" className="ml-2 text-sm text-gray-700">
                          "Yes" passes the inspection
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="no"
                          checked={questionFormData.idealAnswer === false}
                          onChange={() => setQuestionFormData({ ...questionFormData, idealAnswer: false })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="no" className="ml-2 text-sm text-gray-700">
                          "No" passes the inspection
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuestion}>
                    Add Question
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDetails;