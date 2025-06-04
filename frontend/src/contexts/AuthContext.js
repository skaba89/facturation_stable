import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, storeToken as storeTokenInStorage, removeToken as removeTokenFromStorage } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Would need to install jwt-decode: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // User object decoded from token
    const [token, setToken] = useState(getToken());
    const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

    useEffect(() => {
        const currentToken = getToken();
        if (currentToken) {
            try {
                const decodedUser = jwtDecode(currentToken); // npm install jwt-decode
                // You might want to check token expiry here as well
                const currentTime = Date.now() / 1000;
                if (decodedUser.exp && decodedUser.exp < currentTime) {
                    logout(); // Token expired
                } else {
                    setUser({ id: decodedUser.userId, profileType: decodedUser.profileType }); // Adjust based on your JWT payload
                    setToken(currentToken);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout(); // Clear invalid token
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [token]); // Re-run effect if token changes externally or on initial load

    const login = (newToken) => {
        storeTokenInStorage(newToken);
        setToken(newToken);
        setIsAuthenticated(true);
        try {
            const decodedUser = jwtDecode(newToken);
            setUser({ id: decodedUser.userId, profileType: decodedUser.profileType });
        } catch (error) {
            console.error("Error decoding token on login:", error);
            setUser(null); // Or handle more gracefully
        }
    };

    const logout = () => {
        removeTokenFromStorage();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        // Optionally redirect to login page via window.location or router history
        // window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
