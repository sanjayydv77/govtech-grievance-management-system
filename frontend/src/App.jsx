import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import OfficerLayout from './components/layout/OfficerLayout';
import DashboardPage from './pages/Officer/DashboardPage';
import ComplaintsManagementPage from './pages/Officer/ComplaintsManagementPage';
import ComplaintDetailsPage from './pages/Officer/ComplaintDetailsPage';
import HighPriorityPage from './pages/Officer/HighPriorityPage';
import ReportsPage from './pages/Officer/ReportsPage';
import NotificationsPage from './pages/Officer/NotificationsPage';
import HistoryPage from './pages/Officer/HistoryPage';
import SettingsPage from './pages/Officer/SettingsPage';
import LoginPage from './pages/Auth/LoginPage';

// CM Dashboard Imports
import CMLayout from './components/layout/CMLayout';
import CMDashboardPage from './pages/CM/CMDashboardPage';
import DistrictAnalyticsPage from './pages/CM/DistrictAnalyticsPage';
import DepartmentPerformancePage from './pages/CM/DepartmentPerformancePage';
import CriticalIssuesPage from './pages/CM/CriticalIssuesPage';
import TrendsInsightsPage from './pages/CM/TrendsInsightsPage';
import AccountabilityReportsPage from './pages/CM/AccountabilityReportsPage';
import EscalationsPage from './pages/CM/EscalationsPage';
import CMSettingsPage from './pages/CM/CMSettingsPage';

// Simple wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const session = localStorage.getItem('officerSession');
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Officer Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <OfficerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="complaints" element={<ComplaintsManagementPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="high-priority" element={<HighPriorityPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* CM Executive Dashboard Routes (Unauthenticated) */}
        <Route path="/cm" element={<CMLayout />}>
          <Route index element={<Navigate to="/cm/dashboard" replace />} />
          <Route path="dashboard" element={<CMDashboardPage />} />
          <Route path="district-analytics" element={<DistrictAnalyticsPage />} />
          <Route path="department-performance" element={<DepartmentPerformancePage />} />
          <Route path="critical-issues" element={<CriticalIssuesPage />} />
          <Route path="trends-insights" element={<TrendsInsightsPage />} />
          <Route path="accountability-reports" element={<AccountabilityReportsPage />} />
          <Route path="escalations" element={<EscalationsPage />} />
          <Route path="settings" element={<CMSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
