
import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_blogs: 0,
    total_likes: 0,
    total_comments: 0,
    total_categories: 0,
    total_users: 0,
    categories: [],
    users: []
  });

  const [addCategoryName, setAddCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const token = localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')).access : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchStats = async () => {
    try {
      const resStats = await API.get('stats/', { headers: authHeaders });
      setStats(prev => ({
        ...prev,
        total_blogs: resStats.data.total_blogs,
        total_likes: resStats.data.total_likes,
        total_comments: resStats.data.total_comments,
        total_categories: resStats.data.categories.length,
        categories: resStats.data.categories,
        users: resStats.data.users.filter(u => !u.is_admin) // exclude admins
      }));
    } catch (err) {
      console.error('Error fetching stats:', err.response?.data || err);
      alert('Failed to fetch stats');
    }
  };

  const addCategory = async () => {
    if (!addCategoryName.trim()) return;
    try {
      await API.post('categories/', { name: addCategoryName }, { headers: authHeaders });
      setAddCategoryName('');
      fetchStats();
    } catch (err) {
      console.error('Error adding category:', err.response?.data || err);
      alert(err.response?.data?.detail || 'Failed to add category');
    }
  };

  const updateCategory = async (id) => {
    if (!editCategoryName.trim()) return;
    try {
      await API.put(`categories/${id}/`, { name: editCategoryName }, { headers: authHeaders });
      setEditCategoryId(null);
      setEditCategoryName('');
      fetchStats();
    } catch (err) {
      console.error('Error updating category:', err.response?.data || err);
      alert(err.response?.data?.detail || 'Failed to update category');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`categories/${id}/`, { headers: authHeaders });
      fetchStats();
    } catch (err) {
      console.error('Error deleting category:', err.response?.data || err);
      alert(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <div className="row mb-4">
        <div className="col-md-3"><b>Total Blogs:</b> {stats.total_blogs}</div>
        <div className="col-md-3"><b>Total Likes:</b> {stats.total_likes}</div>
        <div className="col-md-3"><b>Total Comments:</b> {stats.total_comments}</div>
        <div className="col-md-3"><b>Total Categories:</b> {stats.total_categories}</div>
      </div>

      <h4>Manage Categories</h4>
      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="New Category Name"
          value={addCategoryName}
          onChange={e => setAddCategoryName(e.target.value)}
        />
        <button className="btn btn-success" onClick={addCategory}>Add Category</button>
      </div>
      <ul className="list-group mb-4">
        {stats.categories.map(cat => (
          <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
            {editCategoryId === cat.id ? (
              <>
                <input
                  type="text"
                  className="form-control me-2"
                  value={editCategoryName}
                  onChange={e => setEditCategoryName(e.target.value)}
                />
                <button className="btn btn-primary btn-sm me-2" onClick={() => updateCategory(cat.id)}>Save</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditCategoryId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {cat.name}
                <span>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => { setEditCategoryId(cat.id); setEditCategoryName(cat.name); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteCategory(cat.id)}>Delete</button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
       
      <h4>Manage Users</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {stats.users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        
      </div>
          
    </div>
  );
};

export default AdminDashboard;





