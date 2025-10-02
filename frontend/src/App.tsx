import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Employees from './pages/Employees';
import QRCodes from './pages/QRCodes';
import WhatsAppMessages from './pages/WhatsAppMessages';
import Settings from './pages/Settings';
import { DashboardProvider } from './contexts/DashboardContext';
<<<<<<< HEAD
=======
// import { AuthProvider, PERMISSIONS } from './contexts/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
>>>>>>> 19ac9948f9ad22309ebbc6117f42dca8227aab87
import AuthCard from './pages/Register';
import PrivateLayout from './middleware/private';
import Signup from './pages/Signup';

function App() {
  return (
<<<<<<< HEAD
    <DashboardProvider>
      <Router>
        <Routes>
            <Route path="/register" element={<AuthCard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<PrivateLayout />}>
            <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="restaurants/:id" element={<RestaurantDetails />} />
            <Route path="employees" element={<Employees />} />
            <Route path="qr-codes" element={<QRCodes />} />
            <Route path="whatsapp-messages" element={<WhatsAppMessages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          </Route>
        </Routes>
      </Router>
    </DashboardProvider>
=======
    // <AuthProvider>
      <DashboardProvider>
        <Router>
          <Routes>
              <Route index path="/" element={<HomePage />} />
              <Route path="/register" element={<AuthCard />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<PrivateLayout />}>
              <Route path="/" element={<Layout />}>
              <Route path='dashboard' element={<Dashboard />} />
              <Route path="restaurants" element={<Restaurants />} />
              <Route path="restaurants/:id" element={<RestaurantDetails />} />
              <Route path="employees" element={<Employees />} />
              <Route path="qr-codes" element={<QRCodes />} />
              <Route path="whatsapp-messages" element={<WhatsAppMessages />} />
              {/* <Route path="accesscontroller" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.ACCESS_CONTROLLER}>
                  <Settings />
                </ProtectedRoute>
              } /> */}
              {/* <Route path="report" element={<ReportNotifications />} /> */}
            </Route>
            </Route>
          </Routes>
        </Router>
      </DashboardProvider>
    // </AuthProvider>
>>>>>>> 19ac9948f9ad22309ebbc6117f42dca8227aab87
  );
}

export default App