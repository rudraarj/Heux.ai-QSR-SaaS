import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  ClipboardList, 
  AlertTriangle,
  Download,
  Filter,
  Eye,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight
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
  AreaChart,
  Area,
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Generate complete date range for spike chart
  const generateDateRange = () => {
    if (!fromDate || !toDate) return [];
    
    const dates = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // Create spike chart data with all dates in range
  const createSpikeChartData = () => {
    const dateRange = generateDateRange();
    const dataMap = new Map();
    
    // Initialize all dates with zero values
    dateRange.forEach(date => {
      const key = date.toISOString().split('T')[0];
      dataMap.set(key, { date: key, passed: 0, attention: 0, total: 0 });
    });
    
    // Fill in actual inspection data
    filteredInspections.forEach(inspection => {
      const dateKey = new Date(inspection.date).toISOString().split('T')[0];
      const entry = dataMap.get(dateKey);
      
      if (entry) {
        entry.total += 1;
        if (inspection.status === 'passed') {
          entry.passed += 1;
        } else if (inspection.status === 'attention') {
          entry.attention += 1;
        }
      }
    });
    
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const spikeChartData = createSpikeChartData();

  // Pagination logic
  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInspections = filteredInspections.slice(startIndex, endIndex);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedRestaurant, selectedSection, selectedEmployee, fromDate, toDate, itemsPerPage]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
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
            <CardTitle>Inspection Activity Spike Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spikeChartData}>
                  <defs>
                    <linearGradient id="passedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="attentionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC',
                      });
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC',
                      });
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="passed" 
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#passedGradient)"
                    name="Passed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="attention" 
                    stackId="1"
                    stroke="#f59e0b"
                    fill="url(#attentionGradient)"
                    name="Needs Attention"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inspection Report</CardTitle>
          <div className="flex items-center space-x-2">
            <select
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={25}>Show 25</option>
              <option value={50}>Show 50</option>
            </select>
            <Button variant="outline" size="sm" icon={<Download size={16} />} onClick={handleExportReport} disabled={filteredInspections.length === 0}>
              Export Report
            </Button>
          </div>
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
                {currentInspections.map(inspection => {
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredInspections.length)} of {filteredInspections.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  icon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                
                {getPaginationRange().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === page
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  icon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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