import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  ClipboardList, 
  AlertTriangle,
  Download,
  Filter,
  Eye,
  ExternalLink
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useDashboard } from '../contexts/DashboardContext';
import { TimeRange } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { InspectionDetails } from '../components/dashboard/InspectionDetails';

const Dashboard = () => {
  const { restaurants, sections, employees, inspections } = useDashboard();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);

  const availableSections = selectedRestaurant === 'all' 
    ? sections 
    : sections.filter(section => section.restaurantId === selectedRestaurant);

  const availableEmployees = employees.filter(employee => {
    const matchesRestaurant = selectedRestaurant === 'all' || employee.restaurantId === selectedRestaurant;
    const matchesSection = selectedSection === 'all' || employee.sectionIds.includes(selectedSection);
    return matchesRestaurant && matchesSection;
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as start
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const isWithinRange = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === 'daily') {
      return date >= startOfToday;
    } else if (timeRange === 'weekly') {
      return date >= startOfWeek;
    } else if (timeRange === 'monthly') {
      return date >= startOfMonth;
    }
    return true;
  };
  
  const filteredInspections = inspections.filter(inspection => {
    const section = sections.find(s => s.id === inspection.sectionId);
    const matchesRestaurant = selectedRestaurant === 'all' || section?.restaurantId === selectedRestaurant;
    const matchesSection = selectedSection === 'all' || inspection.sectionId === selectedSection;
    const matchesEmployee = selectedEmployee === 'all' || inspection.employeeId === selectedEmployee;
    const matchesDate = isWithinRange(inspection.date);
    return matchesRestaurant && matchesSection && matchesEmployee && matchesDate;
  });

  const totalRequested = filteredInspections.length;
  const totalCompleted = filteredInspections.filter(i => i.responses.length > 0).length;
  const totalPassed = filteredInspections.filter(i => i.status === 'passed').length;
  const totalAttention = filteredInspections.filter(i => i.status === 'attention').length;

  const pieChartData = [
    { name: 'Passed', value: totalPassed, color: '#10b981' },
    { name: 'Needs Attention', value: totalAttention, color: '#f59e0b' },
  ];

  const formatTrendKey = (date: Date) => {
    if (timeRange === 'daily') {
      return date.getHours().toString().padStart(2, '0') + ':00'; // 24hr format e.g. 14:00
    }
    if (timeRange === 'weekly') {
      return date.toISOString().split('T')[0]; // yyyy-mm-dd
    }
    if (timeRange === 'monthly') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    return '';
  };
  
  const trendMap = new Map<string, { passed: number; attention: number }>();
  
  filteredInspections.forEach(inspection => {
    const date = new Date(inspection.date);
    const key = formatTrendKey(date);
    const entry = trendMap.get(key) || { passed: 0, attention: 0 };
  
    if (inspection.status === 'passed') {
      entry.passed += 1;
    } else if (inspection.status === 'attention') {
      entry.attention += 1;
    }
  
    trendMap.set(key, entry);
  });
  
  const trendData = Array.from(trendMap.entries())
    .map(([key, value]) => ({ date: key, ...value }))
    .sort((a, b) => {
      // Custom sort: for daily (hours), sort numerically; otherwise by date
      if (timeRange === 'daily') {
        return parseInt(a.date) - parseInt(b.date);
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.name || 'Unknown';
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section?.name || 'Unknown';
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown';
  };

  const getInspectionDetails = (inspectionId: string) => {
    const inspection = filteredInspections.find(i => i.id === inspectionId);
    if (!inspection) return null;

    const section = sections.find(s => s.id === inspection.sectionId);
    if (!section) return null;

    return { inspection, section };
  };

const handleExportReport = () => {
  const exportData = filteredInspections.map((inspection) => {
    const section = sections.find(s => s.id === inspection.sectionId);
    const restaurantName = getRestaurantName(section?.restaurantId || '');
    const sectionName = getSectionName(inspection.sectionId);
    const employeeName = getEmployeeName(inspection.employeeId);
    const inspectionDetails = getInspectionDetails(inspection.id);

    const inspectionDate = new Date(inspection.date);
    const sentDate = inspectionDate.toLocaleDateString();
    const sendTime = inspectionDate.toLocaleTimeString();
    const doneDate = inspectionDate.toLocaleDateString();
    const doneTime = inspectionDate.toLocaleTimeString();
    const inspe = inspectionDetails?.inspection.responses
    ?.map(r => `${r.questionId}:${r.passed ? 'Yes' : 'No'}`)
    .join('; ') ?? ''

    return {
      Employee: employeeName,
      SentDate: sentDate,
      SendTime: sendTime,
      DoneDate: doneDate,
      DoneTime: doneTime,
      Restaurant: restaurantName,
      Section: sectionName,
      Status: inspection.status === 'passed' ? 'Passed' : 'Needs Attention',
      Responses: inspe,
    }
  });

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [
      Object.keys(exportData[0]).join(','), // headers
      ...exportData.map(row => Object.values(row).join(',')), // rows
    ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'inspection_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                value={selectedRestaurant}
                onChange={(e) => {
                  setSelectedRestaurant(e.target.value);
                  setSelectedSection('all');
                  setSelectedEmployee('all');
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

            <div className="flex items-center">
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedEmployee('all');
                }}
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

            <div className="flex items-center">
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={selectedRestaurant === 'all' && selectedSection === 'all'}
              >
                <option value="all">All Employees</option>
                {availableEmployees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white rounded-lg">
              <Button 
                size="sm" 
                variant={timeRange === 'daily' ? 'primary' : 'ghost'}
                onClick={() => setTimeRange('daily')}
              >
                Today
              </Button>
              <Button 
                size="sm" 
                variant={timeRange === 'weekly' ? 'primary' : 'ghost'}
                onClick={() => setTimeRange('weekly')}
              >
                This Week
              </Button>
              <Button 
                size="sm" 
                variant={timeRange === 'monthly' ? 'primary' : 'ghost'}
                onClick={() => setTimeRange('monthly')}
              >
                This Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inspections Requested" 
          value={totalRequested}
          icon={<ClipboardList size={24} className="text-primary-600" />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard 
          title="Inspections Completed" 
          value={totalCompleted}
          icon={<ClipboardCheck size={24} className="text-success" />}
          trend={{ value: 8, positive: true }}
          valueClassName="text-success"
        />
        <StatCard 
          title="Inspections Passed" 
          value={totalPassed}
          icon={<ClipboardCheck size={24} className="text-success" />}
          trend={{ value: 5, positive: true }}
          valueClassName="text-success"
        />
        <StatCard 
          title="Needs Attention" 
          value={totalAttention}
          icon={<AlertTriangle size={24} className="text-warning" />}
          trend={{ value: 2, positive: false }}
          valueClassName="text-warning"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inspection Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis 
    dataKey="date" 
    tickFormatter={(value) => {
      if (timeRange === 'daily') {
        const hour = parseInt(value.split(':')[0]);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12} ${period}`; // e.g. 2 PM
      }
      return new Date(value).toLocaleDateString(); // For weekly/monthly
    }}
  />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line 
    type="monotone" 
    dataKey="passed" 
    stroke="#10b981" 
    name="Passed"
  />
  <Line 
    type="monotone" 
    dataKey="attention" 
    stroke="#f59e0b" 
    name="Needs Attention"
  />
</LineChart>

              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inspection Report</CardTitle>
          <Button variant="outline" size="sm" icon={<Download size={16} /> } onClick={handleExportReport} >
            Export Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent Date
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Done Date
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInspections.map(inspection => {
                  const section = sections.find(s => s.id === inspection.sectionId);
                  return (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getEmployeeName(inspection.employeeId)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {new Date(inspection.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {new Date(inspection.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getRestaurantName(section?.restaurantId || '')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getSectionName(inspection.sectionId)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inspection.status === 'passed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inspection.status === 'passed' ? 'Passed' : 'Needs Attention'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => {/* Handle media view */}}
                        >
                          View
                        </Button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ExternalLink size={16} />}
                          onClick={() => setSelectedInspection(inspection.id)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedInspection && (
        <InspectionDetails
          {...getInspectionDetails(selectedInspection)!}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;