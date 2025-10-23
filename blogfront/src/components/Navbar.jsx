import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Blogging</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {!user && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
            
                
              </>
            )}
            {user && !user.is_admin && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/my-blogs">My Blogs</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/blogs/new">Create Blog</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/profile">{user.username}</Link></li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>
                </li>
              </>
            )}
            {user && user.is_admin && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/dashboard">Admin Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/profile">{"👋"+user.username}</Link></li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>
                  <ToastContainer />
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



