// import React, { useState } from "react";
// import axios from "axios";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/api/auth/reset-password/", {
//         email: email,
//       });

//       if (response.status === 200) {
//         setMessage("If this email exists, a reset link has been sent.");
//       }
//     } catch (error) {
//       setMessage("Error sending reset email. Please try again.");
//     }
//   };

//   return (
//     <div className="container mt-5" style={{ maxWidth: "500px" }}>
//       <div className="card shadow p-4">
//         <h2 className="text-center mb-3">Forgot Password</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Email address</label>
//             <input
//               type="email"
//               className="form-control"
//               placeholder="Enter your registered email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className="btn btn-primary w-100">
//             Send Reset Link
//           </button>
//         </form>
//         {message && (
//           <p className="text-center mt-3 text-info fw-bold">{message}</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);


  // --------------For Forgot Password For A Email
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warning("Please enter your email address!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/reset-password/", {
        email: email,
      });

      if (response.status === 200) {
        toast.success("If this email exists, a reset link has been sent!");
        setEmail("");
      }
    } catch (error) {
      toast.error("Error sending reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow p-4">
        <h2 className="text-center mb-3">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
