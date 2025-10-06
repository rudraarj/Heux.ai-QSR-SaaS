import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { DateRange } from '../../types';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateRangePicker = ({ dateRange, onDateRangeChange }: DateRangePickerProps) => {
  return (
    <div className="flex items-center space-x-2">
      <DatePicker
        selected={dateRange.startDate}
        onChange={(date) => onDateRangeChange({ ...dateRange, startDate: date })}
        selectsStart
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholderText="Start Date"
        dateFormat="MMM d, yyyy"
      />
      <span className="text-gray-500">to</span>
      <DatePicker
        selected={dateRange.endDate}
        onChange={(date) => onDateRangeChange({ ...dateRange, endDate: date })}
        selectsEnd
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        minDate={dateRange.startDate}
        className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholderText="End Date"
        dateFormat="MMM d, yyyy"
      />
    </div>
  );
};