// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// const Register = () => {
//   const { register } = useAuth();
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     password: '',
//     password2: '',
//     profile_picture: null
//   });
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     if(e.target.name === 'profile_picture') {
//       setForm({ ...form, profile_picture: e.target.files[0] });
//     } else {
//       setForm({ ...form, [e.target.name]: e.target.value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password !== form.password2) {
//       setError("Passwords don't match");
//       return;
//     }
//     try {
//       await register(form);
//     } catch (err) {
//       console.error(err.response || err);
//       setError(err.response?.data?.detail || 'Registration failed');
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2>Register</h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label>Username</label>
//           <input type="text" name="username" className="form-control" value={form.username} onChange={handleChange} required />
//         </div>
//         <div className="mb-3">
//           <label>Email</label>
//           <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
//         </div>
//         <div className="mb-3">
//           <label>Password</label>
//           <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
//         </div>
//         <div className="mb-3">
//           <label>Confirm Password</label>
//           <input type="password" name="password2" className="form-control" value={form.password2} onChange={handleChange} required />
//         </div>
//         <div className="mb-3">
//           <label>Profile Picture (optional)</label>
//           <input type="file" name="profile_picture" className="form-control" onChange={handleChange} />
//         </div>
//         <button className="btn btn-primary">Register</button>
//       </form>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify'; 
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    profile_picture: null
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'profile_picture') {
      setForm({ ...form, profile_picture: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password2) {
      toast.error("Passwords don't match ");
      return;
    }

    try {
      await register(form);
      toast.success('Registration successful 🎉');
      navigate('/login'); 
    } catch (err) {
      console.error(err.response || err);
      toast.error(err.response?.data?.detail || 'Registration failed ');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            name="password2"
            className="form-control"
            value={form.password2}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Profile Picture (optional)</label>
          <input
            type="file"
            name="profile_picture"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default Register;
