
import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BlogForm = () => {
  const { id } = useParams(); // blog id for edit
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    content: '',
    category_name: '',
    image: null,
    is_published: false,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories for dropdown
  useEffect(() => {
    API.get('categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // If editing, fetch blog details
  useEffect(() => {
    if (id) {
      setLoading(true);
      API.get(`blogs/${id}/`)
        .then(res => {
          if (res.data.author.id !== user.id && !user.is_admin) {
            alert('You are not authorized to edit this blog.');
            navigate('/');
            return;
          }
          setForm({
            title: res.data.title,
            content: res.data.content,
            category_name: res.data.category?.name || '',
            image: null, // file input starts empty
            is_published: res.data.is_published || false,
          });
        })
        .catch(err => console.error('Error fetching blog:', err))
        .finally(() => setLoading(false));
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    data.append('title', form.title);
    data.append('content', form.content);
    data.append('category_name', form.category_name);
    data.append('is_published', form.is_published ? 'true' : 'false');
    if (form.image) data.append('image', form.image);

    try {
      setLoading(true);
      if (id) {
        await API.put(`blogs/${id}/`, data);
      } else {
        await API.post('blogs/', data);
      }
      navigate('/');
    } catch (err) {
      console.error('Error submitting blog:', err.response?.data || err);
      setError(err.response?.data || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>{id ? 'Edit Blog' : 'Add New Blog'}</h2>
      {error && <div className="alert alert-danger">{JSON.stringify(error)}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Content</label>
          <textarea
            name="content"
            className="form-control"
            value={form.content}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <div className="mb-3">
          <label>Category</label>
          <select
            name="category_name"
            className="form-select"
            value={form.category_name}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Image</label>
          <input type="file" name="image" className="form-control" onChange={handleChange} />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="is_published"
            className="form-check-input"
            checked={form.is_published}
            onChange={handleChange}
          />
          <label className="form-check-label">Publish Now</label>
        </div>

        <button className="btn btn-primary">{id ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
};

export default BlogForm;





