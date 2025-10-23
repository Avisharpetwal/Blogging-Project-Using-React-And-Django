
// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import API from '../api/axios';

// const ResetPasswordConfirm = () => {
//   const { uid, token } = useParams(); 
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ new_password: '', confirm_password: '' });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (form.new_password !== form.confirm_password) {
//       setError("Passwords do not match");
//       return;
//     }

//     try {
//       const response = await API.post(
//         `/auth/reset-password-confirm/${uid}/${token}/`,
//         { new_password: form.new_password }
//       );
//       setSuccess(response.data.detail);
//       setTimeout(() => {
//         navigate('/login'); 
//       }, 2000);
//     } catch (err) {
//       if (err.response && err.response.data && err.response.data.detail) {
//         setError(err.response.data.detail);
//       } else {
//         setError("Something went wrong. Try again.");
//       }
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2>Password Reset</h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       {success && <div className="alert alert-success">{success}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label>New Password</label>
//           <input
//             type="password"
//             name="new_password"
//             className="form-control"
//             value={form.new_password}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <label>Confirm New Password</label>
//           <input
//             type="password"
//             name="confirm_password"
//             className="form-control"
//             value={form.confirm_password}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <button className="btn btn-primary">Reset Password</button>
//       </form>
//     </div>
//   );
// };

// export default ResetPasswordConfirm;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      toast.warning("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post(
        `/auth/reset-password-confirm/${uid}/${token}/`,
        { new_password: form.new_password }
      );

      toast.success(response.data.detail || "Password reset successfully!");
      setForm({ new_password: '', confirm_password: '' });

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow p-4">
        <h2 className="text-center mb-3">Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              name="new_password"
              className="form-control"
              value={form.new_password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              className="form-control"
              value={form.confirm_password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
