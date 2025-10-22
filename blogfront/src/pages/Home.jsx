
import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBlogs = async () => {
    let url = 'blogs/';
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    try {
      const { data } = await API.get(url, { params });
      setBlogs(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('categories/');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchBlogs(); }, [selectedCategory, searchQuery]);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-3">
          {user && <button className="btn btn-success mb-3 w-100" onClick={() => navigate('/blogs/new')}>Add Blog</button>}
          <Sidebar categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
        <div className="col-md-9">
          <input 
            type="text" 
            placeholder="Search by title..." 
            className="form-control mb-3"
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
          />
          {blogs.map(blog => (
            <div key={blog.id} className="card mb-3">
              {blog.image && <img src={`http://127.0.0.1:8000${blog.image}`} className="card-img-top" alt={blog.title} />}
              <div className="card-body">
                <h5 className="card-title">{blog.title}</h5>
                <p className="card-text">By {blog.author.username}</p>
                <p>Likes: {blog.likes_count}</p>
                <Link to={`/blogs/${blog.id}`} className="btn btn-primary btn-sm">Read More</Link>
                {user && blog.author.id === user.id && (
                  <button className="btn btn-warning btn-sm ms-2" onClick={() => navigate(`/blogs/edit/${blog.id}`)}>Edit</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;



