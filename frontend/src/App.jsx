import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/Auth/AuthPage';

// Import Layouts and Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Placeholder Component for other roles
const DashboardPlaceholder = ({ title, roleInfo }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg text-center border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{title}</h1>
        <div className="bg-slate-100 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-slate-600 mb-1">Current User</p>
          <p className="text-lg font-bold text-slate-800">{user?.name || 'Guest'}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-xs bg-indigo-100 text-indigo-700 uppercase font-bold py-1 px-3 rounded-full inline-block mt-2">
            {user?.role}
          </p>
        </div>
        <p className="text-slate-600 mb-8">{roleInfo}</p>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const PublicDashboard = () => <DashboardPlaceholder title="Citizen Dashboard" roleInfo="Submit grievances, track status, and view updates." />;
const OfficerDashboard = () => <DashboardPlaceholder title="Officer Dashboard" roleInfo="Verify complaints, update progress, and resolve tickets." />;
const CMDashboard = () => <DashboardPlaceholder title="CM Analytics Dashboard" roleInfo="High-level metrics, portal health, and strategic overview." />;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard/public" element={<PublicDashboard />} />
      <Route path="/dashboard/officer" element={<OfficerDashboard />} />
      <Route path="/dashboard/cm" element={<CMDashboard />} />

      {/* Admin Routes Wrapped in AdminLayout */}
      <Route path="/dashboard/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        {/* Future sub-routes can be added here */}
      </Route>
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
