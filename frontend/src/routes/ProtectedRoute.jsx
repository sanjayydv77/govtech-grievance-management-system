import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * Wraps routes that require authentication and a specific role.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *     <Route path="/dashboard/admin" element={<AdminLayout />} />
 *   </Route>
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // Show loading spinner while auth state is being read from localStorage
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not logged in → redirect to login page
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Logged in but wrong role → redirect to login with replaced history
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // All checks passed → render the child routes
    return <Outlet />;
};

export default ProtectedRoute;
