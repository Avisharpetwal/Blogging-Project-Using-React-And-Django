// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';

// const Login = () => {
//   const { login } = useAuth();
//   const [form, setForm] = useState({ username: '', password: '' });
//   const navigate = useNavigate();
//   const location = useLocation();
//   const redirectBlogId = location.search?.split('=')[1]; 

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await login(form.username, form.password, redirectBlogId ? redirectBlogId.split('/').pop() : null);
//     } catch {
//       toast.error('Invalid username or password');
//     }
//   };

//   return (
//     <div className="container mt-5" style={{ maxWidth: '400px' }}>
//       <h2 className="text-center mb-4">Login</h2>

//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label>Username</label>
//           <input type="text" name="username" className="form-control" value={form.username} onChange={handleChange} required />
//         </div>

//         <div className="mb-3">
//           <label>Password</label>
//           <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
//         </div>

//         <button className="btn btn-primary w-100">Login</button>
//       </form>

//       <div className="text-center mt-3">
//         <Link to="/forgot-password">Forgot Password?</Link>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({}); 
  const navigate = useNavigate();
  const location = useLocation();
  const redirectBlogId = location.search?.split('=')[1]; 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); 
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; 

    try {
      await login(
        form.username,
        form.password,
        redirectBlogId ? redirectBlogId.split('/').pop() : null
      );
    } catch {
      toast.error('Invalid username or password');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="text-center mb-4">Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={form.username}
            onChange={handleChange}
          />
          {errors.username && <small className="text-danger">{errors.username}</small>}
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <small className="text-danger">{errors.password}</small>}
        </div>

        <button className="btn btn-primary w-100">Login</button>
      </form>

      <div className="text-center mt-3">
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default Login;
