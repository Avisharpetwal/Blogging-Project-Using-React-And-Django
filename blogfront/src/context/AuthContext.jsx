import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem('tokens');
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (tokens) {
      try {
        const decoded = JSON.parse(atob(tokens.access.split('.')[1]));
        setUser(decoded);
      } catch {
        logout();
      }
    }
  }, [tokens]);

  const login = async (username, password) => {
    const { data } = await API.post('auth/login/', { username, password });
    setTokens(data);
    localStorage.setItem('tokens', JSON.stringify(data));
    const decoded = JSON.parse(atob(data.access.split('.')[1]));
    setUser(decoded);
    // to home 
    navigate('/');
  };

  const register = async (formData) => {
    // Using FormData for image upload support
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if(formData[key]) payload.append(key, formData[key]);
    });

    await API.post('auth/register/', payload);
    // Auto login after registration
    await login(formData.username, formData.password);
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('tokens');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



