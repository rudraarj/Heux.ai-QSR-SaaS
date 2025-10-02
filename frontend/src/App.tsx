import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Employees from './pages/Employees';
import QRCodes from './pages/QRCodes';
import WhatsAppMessages from './pages/WhatsAppMessages';
// import Settings from './pages/Settings';
import { DashboardProvider } from './contexts/DashboardContext';
// import { AuthProvider, PERMISSIONS } from './contexts/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
import AuthCard from './pages/Register';
import HomePage from './pages/HomePage'
import PrivateLayout from './middleware/private';
import Signup from './pages/Signup';
// import ReportNotifications from './pages/ReportNotification';

function App() {
  return (
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
  );
}

export default App