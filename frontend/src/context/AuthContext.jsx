import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        if (token) {
            // Basic persistence, ideally check /me
            // For now we trust simple persistence + errors will logout
        }
    }, [token]);

    const login = async (email, password, role) => {
        try {
            const res = await api.post('/auth/login', { email, password, role });
            const { token, user, role: userRole } = res.data;

            setToken(token);
            setRole(userRole);
            setUser(user);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', userRole);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const registerVictim = async (data) => {
        try {
            const res = await api.post('/auth/register/victim', data);
            const { token, user } = res.data;
            setToken(token);
            setRole('VICTIM');
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('role', 'VICTIM');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setToken(null);
        setRole(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, registerVictim, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
