import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { Inspection } from '../../types';
import { useDashboard } from '../../contexts/DashboardContext';

interface InspectionTimelineProps {
  title?: string;
  limit?: number;
}

export const InspectionTimeline = ({ 
  title = "Today's Inspections", 
  limit = 5 
}: InspectionTimelineProps) => {
  const { inspections, employees, sections } = useDashboard();
  
  // Sort inspections by date (newest first) and limit
  const sortedInspections = [...inspections]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getEmployeeImage = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.image;
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown Section';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {sortedInspections.length > 0 ? (
            sortedInspections.map((inspection: Inspection) => (
              <div key={inspection.id} className="relative pl-8 pb-4">
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 h-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 ring-4 ring-primary-50"></div>
                  {/* Line to next item */}
                  <div className="w-0.5 h-full bg-gray-200 ml-0.5 -mt-1"></div>
                </div>
                
                {/* Content */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getSectionName(inspection.sectionId)}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Avatar 
                        src={getEmployeeImage(inspection.employeeId)} 
                        name={getEmployeeName(inspection.employeeId)} 
                        size="sm" 
                        className="mr-2"
                      />
                      {getEmployeeName(inspection.employeeId)} • {formatTime(inspection.date)}
                    </p>
                  </div>
                  <StatusBadge status={inspection.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No inspections recorded for today.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};