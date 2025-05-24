import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
    return null;
  };

const PrivateLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getCookie('Authorization');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  if (!isAuthenticated) {
    toast.warning('you are not authenticated', {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              });
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
};

export default PrivateLayout;
