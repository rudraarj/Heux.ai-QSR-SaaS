import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Types
export type UserRole = 'superadmin' | 'owner' | 'districtmanager' | 'generalmanager';

interface JwtPayload {
  userId: string;
  email: string;
  verified: boolean;
  accountID: string;
  role: UserRole;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: {
    id: string;
    email: string;
    role: UserRole;
    verified: boolean;
    accountID: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessPage: (page: string) => boolean;
  canAccessFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
};

// Permission definitions
const PERMISSIONS = {
  // Page access permissions
  ACCESS_CONTROLLER: 'access_controller',
  ADD_RESTAURANT: 'add_restaurant',
  ADD_EMPLOYEE: 'add_employee',
  
  // Feature permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_RESTAURANTS: 'manage_restaurants',
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_REPORTS: 'view_reports',
  SEND_WHATSAPP: 'send_whatsapp',
} as const;

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: [
    PERMISSIONS.ACCESS_CONTROLLER,
    PERMISSIONS.ADD_RESTAURANT,
    PERMISSIONS.ADD_EMPLOYEE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_RESTAURANTS,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.SEND_WHATSAPP,
  ],
  owner: [
    PERMISSIONS.ACCESS_CONTROLLER,
    PERMISSIONS.ADD_RESTAURANT,
    PERMISSIONS.ADD_EMPLOYEE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_RESTAURANTS,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.SEND_WHATSAPP,
  ],
  districtmanager: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.SEND_WHATSAPP,
    PERMISSIONS.MANAGE_RESTAURANTS,
    PERMISSIONS.MANAGE_EMPLOYEES
    // No ACCESS_CONTROLLER, ADD_RESTAURANT, ADD_EMPLOYEE
  ],
  generalmanager: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.SEND_WHATSAPP,
    PERMISSIONS.MANAGE_RESTAURANTS,
    // No ACCESS_CONTROLLER, ADD_RESTAURANT, ADD_EMPLOYEE
  ],
};

// Page access mapping
const PAGE_PERMISSIONS: Record<string, string> = {
  '/accesscontroller': PERMISSIONS.ACCESS_CONTROLLER,
  '/restaurants': PERMISSIONS.MANAGE_RESTAURANTS,
  '/employees': PERMISSIONS.MANAGE_EMPLOYEES,
  '/report': PERMISSIONS.VIEW_REPORTS,
  '/whatsapp-messages': PERMISSIONS.SEND_WHATSAPP,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getCookie('Authorization');
        if (token) {
          const decoded = jwtDecode<JwtPayload>(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            setUser(null);
            setIsLoading(false);
            return;
          }

          setUser({
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            verified: decoded.verified,
            accountID: decoded.accountID,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const canAccessPage = (page: string): boolean => {
    if (!user) return false;
    
    // If no specific permission is required for the page, allow access
    const requiredPermission = PAGE_PERMISSIONS[page];
    if (!requiredPermission) return true;
    
    return hasPermission(requiredPermission);
  };

  const canAccessFeature = (feature: string): boolean => {
    return hasPermission(feature);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasPermission,
    canAccessPage,
    canAccessFeature,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export permissions for use in components
export { PERMISSIONS };
