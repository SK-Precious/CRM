import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Vendors from './pages/Vendors';
import Admins from './pages/Admins';
import Login from './pages/Login';
import Operations from './pages/Operations';
import BookingOperations from './pages/BookingOperations';
import PaymentApprovals from './pages/PaymentApprovals';
import StaffVenueManagement from './pages/StaffVenueManagement';
import OcrIntake from './pages/OcrIntake';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/admins" element={<Admins />} />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/bookings" element={<BookingOperations />} />
                  <Route path="/payments" element={<PaymentApprovals />} />
                  <Route path="/team" element={<StaffVenueManagement />} />
                  <Route path="/ocr" element={<OcrIntake />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;