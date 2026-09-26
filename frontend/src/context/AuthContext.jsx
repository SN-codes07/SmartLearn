import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartlearn_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartlearn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartlearn_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const userData = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          studentId: res.data.studentId,
          academicYear: res.data.academicYear,
          department: res.data.department,
          token: res.data.token
        };
        setUser(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
      setLoading(false);
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.response?.data || 'Invalid email or password.';
      return { success: false, message: msg };
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', formData);
      setLoading(false);
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartlearn_user');
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('smartlearn_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
