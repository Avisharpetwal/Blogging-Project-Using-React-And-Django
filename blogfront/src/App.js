// import { Routes, Route,Navigate  } from 'react-router-dom';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import BlogDetail from './pages/BlogDetail';
// import BlogForm from './pages/BlogForm';
// import Profile from './pages/Profile';
// import MyBlogs from './pages/MyBlogs';
// import AdminDashboard from './pages/AdminDashboard';
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';
// import { useAuth } from './context/AuthContext';
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";


// function App() {
//   const {user}=useAuth();
//   return (
//     <>
//       <Navbar />
//       <Routes>
       
//         <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />

//         <Route path="/blogs/new" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
//         <Route path="/blogs/edit/:id" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/my-blogs" element={<ProtectedRoute><MyBlogs /></ProtectedRoute>} />
//         <Route path="/blogs/:id" element={<BlogDetail />} />
//         <Route path="/blog-form/:id" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
//         <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        

//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />

//         <Route path="/profile" element={<ProtectedRoute><Profile /> </ProtectedRoute>}/>

//         <Route path="/admin" element={ <ProtectedRoute adminOnly> <AdminDashboard /></ProtectedRoute>} /> </Routes>

//     </>
//   );
// }

// export default App;


import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BlogDetail from './pages/BlogDetail';
import BlogForm from './pages/BlogForm';
import Profile from './pages/Profile';
import MyBlogs from './pages/MyBlogs';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/blogs/new" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
        <Route path="/blogs/edit/:id" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-blogs" element={<ProtectedRoute><MyBlogs /></ProtectedRoute>} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/blog-form/:id" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /> </ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly> <AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
