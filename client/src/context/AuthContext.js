import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userDetails, setUserDetails] = useState(() => {
        const saved = localStorage.getItem('userDetails');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decodedUser.exp < currentTime) {
                    console.warn("Token has expired");
                    setUser(null);
                    setToken(null);
                    setUserDetails(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userDetails');
                    return;
                }
                
                setUser(decodedUser);
                localStorage.setItem('token', token);
                
                // Use cached userDetails on reload, don't fetch
                if (!userDetails) {
                    // Try to use decoded token data
                    const basicUser = {
                        id: decodedUser.id,
                        email: decodedUser.email,
                        username: decodedUser.username,
                        role: decodedUser.role
                    };
                    setUserDetails(basicUser);
                    localStorage.setItem('userDetails', JSON.stringify(basicUser));
                }
                setLoading(false);
            } catch (error) {
                console.error("Invalid token:", error);
                setUser(null);
                setToken(null);
                setUserDetails(null);
                localStorage.removeItem('token');
                localStorage.removeItem('userDetails');
            }
        } else {
            setUser(null);
            setUserDetails(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userDetails');
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            
            // Show warning if partner not approved
            if (res.data.warning) {
                console.warn('⚠️', res.data.warning);
            }
            
            // Save token and user data
            const { token, user: userData } = res.data;
            
            // Store in localStorage first
            localStorage.setItem('token', token);
            if (userData) {
                localStorage.setItem('userDetails', JSON.stringify(userData));
            }
            
            // Decode and set user state
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
            setUserDetails(userData);
            setToken(token); // This triggers useEffect but user is already set
            
            console.log('✅ Login successful:', decodedUser);
            
            return res.data;
        } catch (err) {
            console.error('❌ Login failed:', err);
            throw err;
        }
    };

    const register = async (username, email, password, role = 'client', shopName = null) => {
        try {
            const payload = { username, email, password, role };
            if (role === 'partner' && shopName) {
                payload.shopName = shopName;
            }
            await axios.post('/auth/register', payload);
        } catch (err) {
            console.error('Registration failed', err);
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUserDetails(null);
        localStorage.removeItem('userDetails');
    };

    const updateUser = (userData) => {
        setUserDetails(userData);
        localStorage.setItem('userDetails', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, userDetails, token, loading, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;