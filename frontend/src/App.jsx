import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// ── Auth ──────────────────────────────────────────────────────
import AuthPage from './pages/Auth/AuthPage';

// ── Admin ─────────────────────────────────────────────────────
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AllComplaints from './pages/Admin/AllComplaints';
import ManageOfficers from './pages/Admin/ManageOfficers';
import UserManagement from './pages/Admin/UserManagement';

// ── Shared ────────────────────────────────────────────────────
import GovBanner from './components/GovBanner';

// ── Public (Shivan) ───────────────────────────────────────────
import PublicDashboard from './pages/Public/PublicDashboard';

// ── Officer (Shubham) ──────────────────────────────────────────
import OfficerLayout from './components/layout/OfficerLayout';
import DashboardPage from './pages/Officer/DashboardPage';
import ComplaintsManagementPage from './pages/Officer/ComplaintsManagementPage';
import ComplaintDetailsPage from './pages/Officer/ComplaintDetailsPage';
import HighPriorityPage from './pages/Officer/HighPriorityPage';
import ReportsPage from './pages/Officer/ReportsPage';
import NotificationsPage from './pages/Officer/NotificationsPage';
import HistoryPage from './pages/Officer/HistoryPage';
import SettingsPage from './pages/Officer/SettingsPage';

// ── CM (Shubham) ─────────────────────────────────────────────
import CMLayout from './components/layout/CMLayout';
import CMDashboardPage from './pages/CM/CMDashboardPage';
import DistrictAnalyticsPage from './pages/CM/DistrictAnalyticsPage';
import DepartmentPerformancePage from './pages/CM/DepartmentPerformancePage';
import CriticalIssuesPage from './pages/CM/CriticalIssuesPage';
import TrendsInsightsPage from './pages/CM/TrendsInsightsPage';
import AccountabilityReportsPage from './pages/CM/AccountabilityReportsPage';
import EscalationsPage from './pages/CM/EscalationsPage';
import CMSettingsPage from './pages/CM/CMSettingsPage';

// ── App ───────────────────────────────────────────────────────
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="flex flex-col min-h-screen bg-slate-100">
                    <GovBanner />
                    <div className="flex-1 flex flex-col min-h-0">
                        <Routes>
                            {/* ── Public Auth ── */}
                            <Route path="/" element={<AuthPage />} />

                            {/* ── Citizen Dashboard ── */}
                            <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
                                <Route path="/dashboard/public" element={<PublicDashboard />} />
                            </Route>

                            {/* ── Officer Dashboard ── */}
                            <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
                                <Route path="/dashboard/officer" element={<OfficerLayout />}>
                                    <Route index element={<Navigate to="overview" replace />} />
                                    <Route path="overview" element={<DashboardPage />} />
                                    <Route path="complaints" element={<ComplaintsManagementPage />} />
                                    <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
                                    <Route path="high-priority" element={<HighPriorityPage />} />
                                    <Route path="reports" element={<ReportsPage />} />
                                    <Route path="notifications" element={<NotificationsPage />} />
                                    <Route path="history" element={<HistoryPage />} />
                                    <Route path="settings" element={<SettingsPage />} />
                                </Route>
                            </Route>

                            {/* ── CM Dashboard ── */}
                            <Route element={<ProtectedRoute allowedRoles={['cm']} />}>
                                <Route path="/dashboard/cm" element={<CMLayout />}>
                                    <Route index element={<Navigate to="overview" replace />} />
                                    <Route path="overview" element={<CMDashboardPage />} />
                                    <Route path="district-analytics" element={<DistrictAnalyticsPage />} />
                                    <Route path="department-performance" element={<DepartmentPerformancePage />} />
                                    <Route path="critical-issues" element={<CriticalIssuesPage />} />
                                    <Route path="trends-insights" element={<TrendsInsightsPage />} />
                                    <Route path="accountability-reports" element={<AccountabilityReportsPage />} />
                                    <Route path="escalations" element={<EscalationsPage />} />
                                    <Route path="settings" element={<CMSettingsPage />} />
                                </Route>
                            </Route>

                            {/* ── Admin Dashboard (4 pages) ── */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="/dashboard/admin" element={<AdminLayout />}>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="complaints" element={<AllComplaints />} />
                                    <Route path="officers" element={<ManageOfficers />} />
                                    <Route path="users" element={<UserManagement />} />
                                </Route>
                            </Route>

                            {/* ── Catch-all → Login ── */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
