import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { InspectionStatusChart } from '../components/charts/InspectionStatusChart';
import { SectionIssuesChart } from '../components/charts/SectionIssuesChart';
import { getInspectionStats, getIssuesBySection, getEmployeePerformance } from '../data/mockData';
import { useDashboard } from '../contexts/DashboardContext';
import { TimeRange } from '../types';

const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const { restaurants } = useDashboard();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  
  const stats = getInspectionStats(timeRange);
  const sectionIssues = getIssuesBySection();
  const employeePerformance = getEmployeePerformance();
  
  const chartData = [
    { name: 'Passed', value: stats.passed, color: '#10b981' },
    { name: 'Needs Attention', value: stats.attention, color: '#f59e0b' },
    { name: 'Failed', value: stats.failed, color: '#ef4444' },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter */}
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <div className="px-3 flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <select
                className="bg-transparent border-none text-sm focus:outline-none"
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
              >
                <option value="all">All Restaurants</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="h-6 border-r border-gray-200"></div>
            
            <div className="flex space-x-1">
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
          
          {/* Export button */}
          <Button variant="outline" icon={<Download size={16} />}>
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Inspections</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Pass Rate</p>
              <p className="text-3xl font-bold text-success mt-2">{stats.passRate}%</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-500">Need Attention</p>
              <p className="text-3xl font-bold text-warning mt-2">{stats.attention}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-3xl font-bold text-danger mt-2">{stats.failed}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InspectionStatusChart data={chartData} />
        <SectionIssuesChart data={sectionIssues} />
      </div>
      
      {/* Employee Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Performance</CardTitle>
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
                    Completed Inspections
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Rate
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeePerformance.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      {employee.employee}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {employee.total}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {employee.passRate}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            employee.passRate >= 90 ? 'bg-success' : 
                            employee.passRate >= 70 ? 'bg-warning' : 'bg-danger'
                          }`}
                          style={{ width: `${employee.passRate}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;