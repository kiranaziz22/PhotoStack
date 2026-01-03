import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data || res);
    } catch (err) {
      console.error('Load user error:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = 'consumer', name = null) => {
    // For demo: create a mock token with consistent OID based on email
    // Simple hash function to generate consistent ID from email
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    
    const mockToken = btoa(JSON.stringify({ 
      oid: `user-${hashCode(email)}`, 
      email, 
      name: name || email.split('@')[0],
      role 
    }));
    localStorage.setItem('token', mockToken);
    await loadUser();
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isCreator = user?.role === 'creator';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isCreator, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
