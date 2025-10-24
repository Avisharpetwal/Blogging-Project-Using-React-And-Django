// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-toastify'; 
// import { useNavigate } from 'react-router-dom';

// const Register = () => {
//   const { register } = useAuth();
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     password: '',
//     password2: '',
//     profile_picture: null
//   });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     if (e.target.name === 'profile_picture') {
//       setForm({ ...form, profile_picture: e.target.files[0] });
//     } else {
//       setForm({ ...form, [e.target.name]: e.target.value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (form.password !== form.password2) {
//       toast.error("Passwords don't match ");
//       return;
//     }

//     try {
//       await register(form);
//       toast.success('Registration successful ');
//       navigate('/login'); 
//     } catch (err) {
//       console.error(err.response || err);
//       toast.error(err.response?.data?.detail || 'Registration failed ');
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2>Register</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label>Username</label>
//           <input
//             type="text"
//             name="username"
//             className="form-control"
//             value={form.username}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="mb-3">
//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             className="form-control"
//             value={form.email}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="mb-3">
//           <label>Password</label>
//           <input
//             type="password"
//             name="password"
//             className="form-control"
//             value={form.password}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="mb-3">
//           <label>Confirm Password</label>
//           <input
//             type="password"
//             name="password2"
//             className="form-control"
//             value={form.password2}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="mb-3">
//           <label>Profile Picture (optional)</label>
//           <input
//             type="file"
//             name="profile_picture"
//             className="form-control"
//             onChange={handleChange}
//           />
//         </div>

//         <button className="btn btn-primary">Register</button>
//       </form>
//     </div>
//   );
// };

// export default Register;



import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    profile_picture: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;; 

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture") {
      setForm({ ...form, profile_picture: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }

  
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be at least 8 characters long and include both letters and numbers.";
    }

    if (form.password !== form.password2) {
      newErrors.password2 = "Passwords do not match.";
    }

    if (form.profile_picture) {
      const file = form.profile_picture;
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        newErrors.profile_picture =
          "Profile picture must be a JPG, JPEG, or PNG file.";
      } else if (file.size > 5 * 1024 * 1024) {
        newErrors.profile_picture =
          "Profile picture must be smaller than 5MB.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register(form);
      toast.success('Registration successful!');
      navigate("/login");
    } catch (err) {
      console.error(err.response || err);
      alert(
        err.response?.data?.detail ||
          "Registration failed. Please check your details."
      );
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} noValidate>
      
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            name="username"
            className={`form-control ${
              errors.username ? "is-invalid" : ""
            }`}
            value={form.username}
            onChange={handleChange}
            required
          />
          {errors.username && (
            <div className="text-danger small">{errors.username}</div>
          )}
        </div>

      
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <div className="text-danger small">{errors.email}</div>
          )}
        </div>

        
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className={`form-control ${
              errors.password ? "is-invalid" : ""
            }`}
            value={form.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <div className="text-danger small">{errors.password}</div>
          )}
        </div>

     
        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            name="password2"
            className={`form-control ${
              errors.password2 ? "is-invalid" : ""
            }`}
            value={form.password2}
            onChange={handleChange}
            required
          />
          {errors.password2 && (
            <div className="text-danger small">{errors.password2}</div>
          )}
        </div>

      
        <div className="mb-3">
          <label>Profile Picture (optional)</label>
          <input
            type="file"
            name="profile_picture"
            className={`form-control ${
              errors.profile_picture ? "is-invalid" : ""
            }`}
            onChange={handleChange}
          />
          {errors.profile_picture && (
            <div className="text-danger small">{errors.profile_picture}</div>
          )}
        </div>

        <button className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default Register;

