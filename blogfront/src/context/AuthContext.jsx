
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem('tokens');
    return stored ? JSON.parse(stored) : null;
  });

  // -----------For Navigation---------
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


  // ---------------Login(Username,Password)----------------
  const login = async (username, password, redirectBlogId=null) => {
    const { data } = await API.post('auth/login/', { username, password });
    setTokens(data);
    localStorage.setItem('tokens', JSON.stringify(data));
    const decoded = JSON.parse(atob(data.access.split('.')[1]));
    setUser(decoded);
    toast.success('Login successful!');
    if (redirectBlogId) {
      navigate(`/blogs/${redirectBlogId}`);
    } else {
      navigate('/');
    }
  };
// -------------------Register----------------
  const register = async (formData) => {
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) payload.append(key, formData[key]);
    });
    await API.post('auth/register/', payload);
    // await login(formData.username, formData.password);
  };
// ----------------Logout-------------
  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('tokens');
    toast.success("You have been logged out successfully!");
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


