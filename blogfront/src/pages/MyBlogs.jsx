

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const MyBlogs = () => {
  const { user, tokens } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  // --------------User Blogs (Published + Unpublished)----------------
  useEffect(() => {
    const fetchBlogs = async () => {
      if (!user) return;
      try {
        const config = { headers: { Authorization: `Bearer ${tokens.access}` } };
        const { data } = await API.get('blogs/my-blogs/', config); 
        setBlogs(data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };
    fetchBlogs();
  }, [user, tokens]);

  // -------------------Edit Blog-------------------
  const handleEdit = (id) => navigate(`/blogs/edit/${id}`);

  // -------------------Delete Blog-------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${tokens.access}` } };
      await API.delete(`blogs/${id}/`, config);
      setBlogs(blogs.filter(blog => blog.id !== id));
    } catch (err) {
      alert('You are not authorized to delete this blog.');
      console.error(err);
    }
  };

  // -------------------Read More-------------------
  const handleReadMore = (id) => navigate(`/blogs/${id}`);

  return (
    <div className="container mt-4">
      <h2>My Blogs</h2>
      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        blogs.map(blog => (
          <div key={blog.id} className="card mb-3">
            {blog.image && (
              <img
                src={`http://127.0.0.1:8000${blog.image}`}
                className="card-img-top"
                alt={blog.title}
              />
            )}
            <div className="card-body">
              <h5 className="card-title">{blog.title}</h5>

              {/* Blog status */}
              <p className="text-muted">
                Status:{' '}
                {blog.is_published ? (
                  <span className="text-success fw-bold">Published </span>
                ) : (
                  <span className="text-danger fw-bold">Unpublished </span>
                )}
              </p>

              <p className="card-text">
                {blog.content.length > 150
                  ? `${blog.content.slice(0, 150)}...`
                  : blog.content}
              </p>

              {blog.content.length > 150 && (
                <button className="btn btn-link p-0" onClick={() => handleReadMore(blog.id)}>
                  Read More
                </button>
              )}

              <p className="card-text">
                <small className="text-muted">
                  Category: {blog.category?.name || 'No category'}
                </small>
              </p>

              {/* Edit/Delete buttons */}
              <button className="btn btn-warning me-2" onClick={() => handleEdit(blog.id)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(blog.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBlogs;
