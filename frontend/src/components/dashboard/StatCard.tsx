import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon,
  trend,
  className,
  valueClassName
}: StatCardProps) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={cn("text-2xl font-semibold mt-1", valueClassName)}>
              {value}
            </p>
            
            {trend && (
              <div className="flex items-center mt-2">
                {trend.positive ? (
                  <ArrowUpRight size={16} className="text-success mr-1" />
                ) : (
                  <ArrowDownRight size={16} className="text-danger mr-1" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-success" : "text-danger"
                )}>
                  {trend.value}% from last week
                </span>
              </div>
            )}
          </div>
          
          <div className="p-3 rounded-lg bg-gray-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};