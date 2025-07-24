import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Restaurant, Employee, Section, Inspection } from '../types';

import { mockRestaurants, mockEmployees, mockSections, mockInspections } from '../data/mockData';
import axios from 'axios';
import { toast } from 'react-toastify';

interface DashboardContextType {
  restaurants: Restaurant[];
  employees: Employee[];
  sections: Section[];
  inspections: Inspection[];
  addRestaurant: (restaurant: Omit<Restaurant, 'id'>) => void;
  updateRestaurant: (id: string, restaurant: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addSection: (section: Omit<Section, 'id'>) => void;
  updateSection: (id: string, section: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  updateQuestion: (sectionId: string, questionId: string, updatedQuestion: any) => Promise<void>; // Add this
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

//all fetch data here for dashboard
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [inspections] = useState<Inspection[]>(mockInspections);

  const addRestaurant = async (restaurant: Omit<Restaurant, 'id'>) => {
    const newRestaurant = {
    ...restaurant,
    id: `restaurant-${Date.now()}`,
  };

  const formData = new FormData();

  // Append all fields from newRestaurant except image
  for (const key in newRestaurant) {
    if (key !== 'image') {
      formData.append(key, String(newRestaurant[key as keyof typeof newRestaurant]));
    }
  }

  // Append the actual file
  formData.append('image', restaurant.image[0]);

  try {
    const resp = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}api/data/addrestaurant`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
      if(resp.data.success){
        setRestaurants(resp.data.allRestaurant);
        toast.success('New Restaurant Added!', {
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
  };

  const updateRestaurant = (id: string, updatedRestaurant: Partial<Restaurant>) => {
    setRestaurants(
      restaurants.map((restaurant) =>
        restaurant.id === id ? { ...restaurant, ...updatedRestaurant } : restaurant
      )
    );
  };

  const deleteRestaurant = (id: string) => {
    setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
  };

  const addEmployee = async(employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: `employee-${Date.now()}`,
    };
    try {
      const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/data/addemployee`,newEmployee,
        {
          withCredentials: true,  // Correct option to include cookies
        });
      if(resp.data.success){
        setEmployees(resp.data.allemployee)
        toast.success('New Employee Added!', {
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
  };

  const updateEmployee = async (id: string, updatedEmployee: Partial<Employee>) => {
    try {
      const employeeWithId = { ...updatedEmployee, id };
      const resp = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}api/data/updateemployee`,employeeWithId,
        {
          withCredentials: true,
        });
      if(resp.data.success){
        setEmployees(
          employees.map((employee) =>
            employee.id === id ? { ...employee, ...updatedEmployee } : employee
          )
        );
        toast.success('Employee updated !', {
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
   
  };

  const deleteEmployee = async (id: string) => {
    try {
      const resp = await axios.delete(
  `${import.meta.env.VITE_BACKEND_URL}api/data/deleteEmployee`,
  {
    withCredentials: true,
    data: { id }, // send id in request body
  }
);
      if(resp.data.success){
        // setSections(resp.data.allSection);
        setEmployees(resp.data.allEmployee);
        toast.success('employee deleted successfully!', {
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
    
  };

  const addSection = async(section: Omit<Section, 'id'>) => {
    const newSection = {
      ...section,
      id: `section-${Date.now()}`,
    };
    try {
      const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/data/addsection`,newSection,
        {
          withCredentials: true,  // Correct option to include cookies
        });
      if(resp.data.success){
        setSections(resp.data.allSection);
        toast.success('New Section Added!', {
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
  };

  const updateSection = (id: string, updatedSection: Partial<Section>) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, ...updatedSection } : section
      )
    );
  };

  const deleteSection = async (id: string) => {
    try {
      const resp = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}api/data/deleteSection`,
        {
          withCredentials: true,
          data: { id }, // send id in request body
        }
      );
      if(resp.data.success){
        // setSections(resp.data.allSection);
        setSections(resp.data.allSection);
        toast.success('section deleted successfully!', {
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
  };

  // Add the updateQuestion function
  const updateQuestion = async (sectionId: string, questionId: string, updatedQuestion: any) => {
    try {
      const questionData = {
        id: questionId,
        text: updatedQuestion.text,
        sectionId: sectionId,
        idealAnswer: updatedQuestion.idealAnswer,
      };

      const resp = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}api/data/updatequestion`, 
        questionData, 
        {
          withCredentials: true,
        }
      );
      
      if (resp.data.success) {
        // Update the section with the new questions array from the backend response
        setSections(sections.map(section => 
          section.id === sectionId 
            ? { ...section, questions: resp.data.questions }
            : section
        ));
        
        toast.success('Question Updated!', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
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
      toast.error(`Something went wrong ${error}`, {
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
  };

  return (
    <DashboardContext.Provider
      value={{
        restaurants,
        employees,
        sections,
        inspections,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addSection,
        updateSection,
        deleteSection,
        updateQuestion, // Add this to the context value
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};