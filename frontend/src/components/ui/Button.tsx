import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-warning text-white hover:bg-amber-600 focus:ring-amber-500',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'start' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'end' && <span className="ml-2">{icon}</span>}
    </button>
  );
};