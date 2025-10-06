import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card = ({ className, children, onClick }: CardProps) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-card p-6 transition-all duration-200",
        onClick && "hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) => {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
};

export const CardContent = ({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

export const CardFooter = ({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("mt-4 pt-4 border-t border-gray-100 flex items-center justify-between", className)}>
      {children}
    </div>
  );
};