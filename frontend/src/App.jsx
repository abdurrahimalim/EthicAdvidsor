import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './utils/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import ResultPage from './pages/ResultPage'
import ESGReportPage from './pages/ESGReportPage'
import OJKStatusPage from './pages/OJKStatusPage'
import NotificationsPage from './pages/NotificationsPage'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected - User */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute><UploadPage /></ProtectedRoute>
      } />
      <Route path="/result" element={
        <ProtectedRoute><ResultPage /></ProtectedRoute>
      } />
      <Route path="/esg-report" element={
        <ProtectedRoute><ESGReportPage /></ProtectedRoute>
      } />
      <Route path="/ojk-status" element={
        <ProtectedRoute><OJKStatusPage /></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><NotificationsPage /></ProtectedRoute>
      } />

      {/* Protected - Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}