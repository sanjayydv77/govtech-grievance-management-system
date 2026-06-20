import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On first load — restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to restore session from localStorage:', error);
                // Corrupt data — clear everything and force re-login
                logout();
            }
        }

        setLoading(false); // Auth state resolved — ProtectedRoute can now render
    }, []);

    /**
     * login — Called after a successful API login/register response.
     * Stores user and token in both state and localStorage for session persistence.
     */
    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    /**
     * logout — Clears all auth state and localStorage.
     * The api.js response interceptor also calls window.location.href='/'
     * on 401 responses, ensuring logout on token expiry.
     */
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {/* Only render children once loading is resolved to prevent flash of wrong content */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

/**
 * useAuth — Custom hook for consuming AuthContext in any component.
 * Usage: const { user, token, login, logout } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);
