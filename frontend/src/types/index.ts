export interface Restaurant {
  id: string;
  name: string;
  location: string;
  image: FileList;
  status:'passed' | 'failed' | 'attention' | 'process'
}

export interface Employee {
  id: string;
  name: string;
  whatsappNumber: string;
  employeeId: string;
  restaurantId: string;
  sectionIds: string[];
  image?: string;
}

export interface Question {
  id: string;
  text: string;
  sectionId: string;
  idealAnswer: boolean; // true means "yes" passes, false means "no" passes
}

export interface Section {
  id: string;
  name: string;
  restaurantId: string;
  frequency: 'daily' | 'twice-daily' | 'custom';
  customTimes?: string[];
  questions: Question[];
}

export interface Inspection {
  id: string;
  sectionId: string;
  employeeId: string;
  date: string;
  status: 'passed' | 'failed' | 'attention';
  responses: {
    questionId: string;
    passed: boolean;
    comment?: string;
  }[];
  images?: string[];
}

export interface WhatsAppNotification {
  id: string;
  restaurantId: string;
  sectionId: string;
  frequency: 'daily' | 'alternate';
  time: string;
  isActive: boolean;
  timeZone:string;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'custom' | 'lifetime';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface Notification {
  frequency: 'daily' | 'alternate';
  id: string;
  isActive: boolean;
  restaurantId: string;
  sectionId: string;
  time: string;
}