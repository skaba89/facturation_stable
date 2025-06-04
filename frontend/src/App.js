import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import InvoicesPage from './pages/InvoicesPage';

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    // Optional: Check for user object if it's critical for the children components
    if (!user) {
        // This case might happen briefly if token is present but user object is still loading
        // Or if token is invalid and logout clears user before redirect.
        // Depending on AuthContext logic, this might already be handled by isAuthenticated.
        return <p>Loading user data or session expired...</p>; // Or redirect to login
    }
    return children;
};

const AppNavigation = () => {
    const { isAuthenticated, logout, user } = useAuth();
    return (
        <nav>
            <ul>
                <li><Link to="/">Home (Invoices)</Link></li>
                {isAuthenticated ? (
                    <>
                        <li>Welcome, {user?.profileType || 'User'}! (User ID: {user?.id})</li>
                        <li><button onClick={logout}>Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
            <hr />
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppNavigation />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <InvoicesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/invoices" // Explicit invoices path
                        element={
                            <ProtectedRoute>
                                <InvoicesPage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Add other routes here */}
                    <Route path="*" element={<Navigate to="/" />} /> {/* Fallback to home */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
