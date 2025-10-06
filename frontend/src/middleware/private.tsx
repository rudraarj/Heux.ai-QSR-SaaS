import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

interface JwtPayload {
  userId: string;
  email: string;
  verified: boolean;
  positions: string;
  iat: number;
  exp: number;
}

const PrivateLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getCookie('Authorization');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        // store "positions" in cookie if not already stored
        setCookie('Position', decoded.positions);

        setIsAuthenticated(true);
      } catch (err) {
        console.error('Invalid token:', err);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  if (!isAuthenticated) {
    toast.warning('You are not authenticated', {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
};

export default PrivateLayout;
