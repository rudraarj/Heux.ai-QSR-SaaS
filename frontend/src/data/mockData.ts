"use client"
import axios from 'axios';
import { Restaurant, Employee, Section, Inspection } from '../types';

// getDashboardData().then((data) => {
//   console.log('📦 WebSocket Dashboard Data:', data);

//   console.log('🧪 Inspections:', data.inspection);
//   console.log('👨‍🍳 Employees:', data.employees);
//   console.log('🏬 Restaurants:', data.restaurant);
//   console.log('📍 Sections:', data.section);
// });

// let socket: WebSocket | null = null;

// type DashboardData = {
//   type: 'inspection_data';
//   inspection: Inspection[];
//   employees: Employee[];
//   restaurant: Restaurant[];
//   section: Section[];
// };

// let dashboardData: DashboardData | null = null;
// let listeners: ((data: DashboardData) => void)[] = [];

// /**
//  * Connects to the WebSocket server and handles incoming messages.
//  */
// export function connectWebSocket() {
//   if (socket && socket.readyState === WebSocket.OPEN) return;

//   socket = new WebSocket('ws://localhost:8080');

//   socket.onopen = () => {
//     console.log('🟢 WebSocket connected');
//     socket?.send(JSON.stringify({ type: 'get_inspection_data' }));
//   };

//   socket.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//   console.log(data)
//     if (data.type === 'inspection_data') {
//       dashboardData = data;
//       listeners.forEach((cb) => cb(data));
//       listeners = []; // clear listeners after resolving
//     }
//   };

//   socket.onclose = () => {
//     console.log('🔴 WebSocket closed');
//   };

//   socket.onerror = (err) => {
//     console.error('❌ WebSocket error:', err);
//   };
// }

// /**
//  * Adds a listener to be called when dashboard data is available.
//  * If data is already available, the callback is called immediately.
//  */
// export function onDashboardData(callback: (data: DashboardData) => void) {
//   if (dashboardData) {
//     callback(dashboardData);
//   } else {
//     listeners.push(callback);
//   }
// }

// /**
//  * Returns a Promise that resolves with the dashboard data.
//  */
// export function getDashboardData(): Promise<DashboardData> {
//   return new Promise((resolve) => {
//     if (dashboardData) {
//       resolve(dashboardData);
//     } else {
//       listeners.push(resolve);
//     }
//   });
// }



// export async function getMockInspections(): Promise<any> {
//   connectWebSocket()
//   const data = await getDashboardData();
//   return data;
// }
// const fetchData = await getMockInspections()

export async function data() {
  try {
    const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/data/dashboard`,
      {
        withCredentials: true,  // Correct option to include cookies
      });
    return resp.data; 
  } catch (error) {
    console.log(error);
    return [];
  }
}
const fetchData = await data()
export const mockInspections: Inspection[] = fetchData.inspection;
export const mockSections: Section[] = fetchData.section;
export const mockRestaurants: Restaurant[] = fetchData.restaurant;
export const mockEmployees: Employee[] = fetchData.employees;

export const getInspectionStats = (timeRange: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  // This would typically filter by date range
  const totalInspections = mockInspections.length;
  const passedCount = mockInspections.filter((i) => i.status === 'passed').length;
  const attentionCount = mockInspections.filter((i) => i.status === 'attention').length;
  const failedCount = mockInspections.filter((i) => i.status === 'failed').length;
  
  return {
    total: totalInspections,
    passed: passedCount,
    attention: attentionCount,
    failed: failedCount,
    passRate: Math.round((passedCount / totalInspections) * 100),
  };
};

export const getIssuesBySection = () => {
  const sectionIssues = mockSections.map((section) => {
    const sectionInspections = mockInspections.filter((i) => i.sectionId === section.id);
    const issueCount = sectionInspections.filter((i) => i.status !== 'passed').length;
    
    return {
      section: section.name,
      issues: issueCount,
    };
  });
  
  return sectionIssues.sort((a, b) => b.issues - a.issues);
};

export const getEmployeePerformance = () => {
  return mockEmployees.map((employee) => {
    const employeeInspections = mockInspections.filter((i) => i.employeeId === employee.id);
    const totalInspections = employeeInspections.length;
    const passedInspections = employeeInspections.filter((i) => i.status === 'passed').length;
    
    return {
      employee: employee.name,
      total: totalInspections,
      passRate: totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0,
    };
  });
};
