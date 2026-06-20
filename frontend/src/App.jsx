import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth
import AuthPage from './pages/Auth/AuthPage';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';

// ─────────────────────────────────────────────────────────────────
// Placeholder components for dashboards being built by your team.
// These will be replaced by the real components once your team
// merges their branches. The ProtectedRoute guards are already
// wired correctly so connectivity will work automatically.
// ─────────────────────────────────────────────────────────────────
const PublicDashboard = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-200 text-center max-w-md">
      <div className="text-5xl mb-4">🏛️</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Citizen Dashboard</h1>
      <p className="text-slate-500 text-sm">Under development by the team. Submit & track your grievances here.</p>
    </div>
  </div>
);

const OfficerDashboard = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-200 text-center max-w-md">
      <div className="text-5xl mb-4">👮</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Officer Dashboard</h1>
      <p className="text-slate-500 text-sm">Under development by the team. Verify & resolve assigned complaints here.</p>
    </div>
  </div>
);

const CMDashboard = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-200 text-center max-w-md">
      <div className="text-5xl mb-4">📊</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">CM Analytics Dashboard</h1>
      <p className="text-slate-500 text-sm">Under development by the team. High-level metrics & strategic overview.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Auth Page ── */}
      <Route path="/" element={<AuthPage />} />

      {/* ── Citizen (Public) Dashboard ── */}
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

      {/* ── Admin Dashboard (with nested sub-routes) ── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/dashboard/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* Future admin sub-pages will slot in here */}
        </Route>
      </Route>

      {/* ── Catch-all: redirect unknown routes to login ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
