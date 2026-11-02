import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const demoToken = 'expertease-local-demo';
const demoUser = {
  _id: 'local-demo-customer',
  name: 'Demo Customer',
  email: 'demo@expertease.local',
  role: 'customer',
  isApproved: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (demoMode && token === demoToken) {
        setUser(demoUser);
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    if (demoMode) {
      localStorage.setItem('token', demoToken);
      setUser(demoUser);
      return demoUser;
    }

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
