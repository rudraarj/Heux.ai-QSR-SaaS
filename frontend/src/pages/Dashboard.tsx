import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  ClipboardList, 
  AlertTriangle,
  Download,
  Filter,
  Eye,
  ExternalLink,
  Calendar
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
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);

  // Set default date range to current month
  React.useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFromDate(firstDayOfMonth.toISOString().split('T')[0]);
    setToDate(lastDayOfMonth.toISOString().split('T')[0]);
  }, []);

  const availableSections = selectedRestaurant === 'all' 
    ? [] // Only show sections after a restaurant is selected
    : sections.filter(section => section.restaurantId === selectedRestaurant);

  const availableEmployees = employees.filter(employee => {
    const matchesRestaurant = selectedRestaurant === 'all' || employee.restaurantId === selectedRestaurant;
    const matchesSection = selectedSection === 'all' || employee.sectionIds.includes(selectedSection);
    return matchesRestaurant && matchesSection;
  });

  const isWithinDateRange = (dateStr: string) => {
    if (!fromDate && !toDate) return true;
    
    const date = new Date(dateStr);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    
    // Set time to start of day for from date and end of day for to date
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);
    
    if (from && to) {
      return date >= from && date <= to;
    } else if (from) {
      return date >= from;
    } else if (to) {
      return date <= to;
    }
    
    return true;
  };
  
  const filteredInspections = inspections.filter(inspection => {
    const section = sections.find(s => s.id === inspection.sectionId);
    const matchesRestaurant = selectedRestaurant === 'all' || section?.restaurantId === selectedRestaurant;
    const matchesSection = selectedSection === 'all' || inspection.sectionId === selectedSection;
    const matchesEmployee = selectedEmployee === 'all' || inspection.employeeId === selectedEmployee;
    const matchesDate = isWithinDateRange(inspection.date);
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

  // Determine trend data grouping based on date range
  const getDateRangeInDays = () => {
    if (!fromDate || !toDate) return 30; // default
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatTrendKey = (date: Date) => {
    const rangeDays = getDateRangeInDays();
    
    if (rangeDays <= 1) {
      // Hourly grouping for single day
      return date.getHours().toString().padStart(2, '0') + ':00';
    } else if (rangeDays <= 7) {
      // Daily grouping for week or less
      return date.toISOString().split('T')[0];
    } else {
      // Weekly grouping for longer periods
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      return startOfWeek.toISOString().split('T')[0];
    }
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
      const rangeDays = getDateRangeInDays();
      if (rangeDays <= 1) {
        // Sort by hour
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
      const inspe = inspection.responses
      ?.map(r => {
        const question = section?.questions.find(q => q.id === r.questionId);
        const questionText = question?.text || `Question ID: ${r.questionId}`;
        return `${questionText}: ${r.passed ? 'Yes' : 'No'}`;
      })
      .join('; ') ?? '';
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
        Object.keys(exportData[0] || {}).join(','), // headers
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
      {/* IMPROVED FILTER SECTION */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            
            {/* Restaurant Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Filter size={14} className="mr-2 text-gray-500" />
                Restaurant
              </label>
              <select
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            {/* Section Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            {/* Employee Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            {/* From Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar size={14} className="mr-2 text-gray-500" />
                From
              </label>
              <input
                type="date"
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
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
                      const rangeDays = getDateRangeInDays();
                      if (rangeDays <= 1) {
                        const hour = parseInt(value.split(':')[0]);
                        const period = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        return `${hour12} ${period}`;
                      }
                      return new Date(value).toLocaleDateString();
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
          <Button variant="outline" size="sm" icon={<Download size={16} /> } onClick={handleExportReport} disabled={filteredInspections.length === 0} >
            Export Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Done Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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