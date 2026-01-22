import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && role) {
      setUser({ token, role, userId: localStorage.getItem('userId') });
    }
    setLoading(false);
  }, [token, role]);

  const login = async (email, password, userRole) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        role: userRole
      });

      const { token, role, user_id } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', user_id);
      
      setToken(token);
      setRole(role);
      setUser({ token, role, userId: user_id });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const registerStudent = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/auth/student/register`, data);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'student');
      localStorage.setItem('userId', user.student_id);
      
      setToken(token);
      setRole('student');
      setUser({ token, role: 'student', userId: user.student_id });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const registerCompany = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/auth/company/register`, data);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'company');
      localStorage.setItem('userId', user.company_id);
      
      setToken(token);
      setRole('company');
      setUser({ token, role: 'company', userId: user.company_id });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, registerStudent, registerCompany, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};