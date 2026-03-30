import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AppointmentDashboard from './components/AppointmentDashboard';
import AdminAppointmentList from './components/AdminAppointmentList';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CancelAppointment from './pages/CancelAppointment';
import DeleteAppointment from './pages/DeleteAppointment';
import AppointmentStatus from './pages/AppointmentStatus';
import SlotBooking from './pages/SlotBooking';
import Profile from './pages/Profile';
import BookingSuccess from './pages/BookingSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import SendOtp from './pages/SendOtp';
import VerifyOtp from './pages/VerifyOtp';
import Navbar from './components/Navbar';

function App() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // A user is fully authenticated only if they have a token AND are verified via OTP
  // For older accounts without an isVerified field, we assume true until they are forced to re-verify,
  // but let's strictly enforce verification if the field exists and is false.
  const isVerified = user.isVerified !== false;
  const isAuthenticated = !!token && isVerified;

  const isAdmin = user.role === 'Admin' || user.role === 'Hospital';
  const userId = user.id || user._id; // Handle both id formats just in case

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="flex-1 w-full flex-grow p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/send-otp" element={<SendOtp />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/book" element={<SlotBooking />} />
            <Route path="/dashboard" element={<AppointmentDashboard userId={userId} />} />
            <Route path="/status" element={<AppointmentStatus />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/success" element={<BookingSuccess />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} />
            <Route path="/admin/analytics" element={isAdmin ? <AdminAnalytics /> : <Navigate to="/dashboard" replace />} />
            <Route path="/admin" element={isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />} />

            <Route path="/cancel/:id" element={<CancelAppointment />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
