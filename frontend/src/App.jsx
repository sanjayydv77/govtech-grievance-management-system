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

// ── Placeholders (team members' dashboards — replace when merged) ─
const PlaceholderPage = ({ emoji, title, desc }) => (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-200 text-center max-w-md">
            <div className="text-6xl mb-5">{emoji}</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            <div className="mt-6 inline-block bg-slate-100 text-slate-500 text-xs font-semibold px-4 py-2 rounded-full">Under Development by Team</div>
        </div>
    </div>
);

const OfficerDashboard = () => <PlaceholderPage emoji="👮" title="Officer Dashboard" desc="Verify and resolve assigned complaints. Built by Shubham — coming soon." />;
const CMDashboard      = () => <PlaceholderPage emoji="📊" title="CM Analytics Dashboard" desc="High-level monitoring and strategic overview of all portal activity." />;

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
                                <Route path="/dashboard/officer" element={<OfficerDashboard />} />
                            </Route>

                            {/* ── CM Dashboard ── */}
                            <Route element={<ProtectedRoute allowedRoles={['cm']} />}>
                                <Route path="/dashboard/cm" element={<CMDashboard />} />
                            </Route>

                            {/* ── Admin Dashboard (4 pages) ── */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="/dashboard/admin" element={<AdminLayout />}>
                                    {/* index = /dashboard/admin */}
                                    <Route index element={<AdminDashboard />} />
                                    {/* /dashboard/admin/complaints */}
                                    <Route path="complaints" element={<AllComplaints />} />
                                    {/* /dashboard/admin/officers */}
                                    <Route path="officers" element={<ManageOfficers />} />
                                    {/* /dashboard/admin/users */}
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
