import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();

  // ---------- STATES ----------
  const [stats, setStats] = useState({
    total_blogs: 0,
    total_likes: 0,
    total_comments: 0,
    total_categories: 0,
    total_users: 0,
    categories: [],
    users: [],
    blogs: [],
    daily_blogs: [],
    monthly_blogs: [],
    daily_users: [],
    monthly_users: [],
  });

  const [addCategoryName, setAddCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [chartType, setChartType] = useState('total'); 

  const token = localStorage.getItem('tokens')
    ? JSON.parse(localStorage.getItem('tokens')).access
    : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // ---------- FETCH STATS ----------
  const fetchStats = async () => {
    try {
      const res = await API.get('stats/', { headers: authHeaders });
      setStats({
        total_blogs: res.data.total_blogs,
        total_likes: res.data.total_likes,
        total_comments: res.data.total_comments,
        total_categories: res.data.total_categories,
        total_users: res.data.users.length,
        categories: res.data.categories,
        users: res.data.users.filter((u) => !u.is_admin),
        blogs: res.data.blogs,
        daily_blogs: res.data.daily_blogs,
        monthly_blogs: res.data.monthly_blogs,
        daily_users: res.data.daily_users,
        monthly_users: res.data.monthly_users,
      });
    } catch (err) {
      console.error('Error fetching stats:', err.response?.data || err);
      alert('Failed to fetch stats ');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ---------- CHART DATA FROM BACKEND ----------
  const getChartData = () => {
    if (!stats.daily_blogs || !stats.monthly_blogs) return [];

    if (chartType === 'daily') {
      return stats.daily_blogs.map((item, i) => ({
        name: item.date,
        blogs: item.count,
        users: stats.daily_users[i]?.count || 0,
      }));
    }

    if (chartType === 'monthly') {
      return stats.monthly_blogs.map((item, i) => ({
        name: item.month?.substring(0, 7),
        blogs: item.count,
        users: stats.monthly_users[i]?.count || 0,
      }));
    }

    // Total
    return [
      {
        name: 'Total',
        blogs: stats.total_blogs,
        users: stats.total_users,
      },
    ];
  };

  const chartData = getChartData();

  // ---------- ADD CATEGORY ----------
  const addCategory = async () => {
    if (!addCategoryName.trim()) return alert("Please enter a category name");
    try {
      await API.post(
        'categories/',
        { name: addCategoryName },
        { headers: authHeaders }
      );
      alert('Category added successfully ');
      setAddCategoryName('');
      fetchStats();
    } catch (err) {
      console.error('Error adding category:', err.response?.data || err);
      alert('Failed to add category ');
    }
  };

  // ---------- UPDATE CATEGORY ----------
  const updateCategory = async (id) => {
    if (!editCategoryName.trim()) return;
    try {
      await API.put(
        `categories/${id}/`,
        { name: editCategoryName },
        { headers: authHeaders }
      );
      alert('Category updated successfully ');
      setEditCategoryId(null);
      setEditCategoryName('');
      fetchStats();
    } catch (err) {
      console.error('Error updating category:', err.response?.data || err);
      alert('Failed to update category ');
    }
  };

  // ---------- DELETE CATEGORY ----------
  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`categories/${id}/`, { headers: authHeaders });
      alert('Category deleted ');
      fetchStats();
    } catch (err) {
      console.error('Error deleting category:', err.response?.data || err);
      alert('Failed to delete category ');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      {/* ---------- STATS  ---------- */}
      <div className="row mb-4">
        <div className="col-md-3"><b>Total Blogs:</b> {stats.total_blogs}</div>
        <div className="col-md-3"><b>Total Likes:</b> {stats.total_likes}</div>
        <div className="col-md-3"><b>Total Comments:</b> {stats.total_comments}</div>
        <div className="col-md-3"><b>Total Categories:</b> {stats.total_categories}</div>
      </div>

      {/* ---------- CHART  ---------- */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4>Blogs & Users Overview</h4>
          <select
            className="form-select w-auto"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="total">Total</option>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="blogs" fill="#8884d8" name="Blogs" />
              <Bar dataKey="users" fill="#82ca9d" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- CATEGORY ---------- */}
      <h4>Manage Categories</h4>
      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="New Category Name"
          value={addCategoryName}
          onChange={(e) => setAddCategoryName(e.target.value)}
        />
        <button className="btn btn-success" onClick={addCategory}>Add Category</button>
      </div>

      <ul className="list-group mb-4">
        {stats.categories.map((cat) => (
          <li
            key={cat.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {editCategoryId === cat.id ? (
              <>
                <input
                  type="text"
                  className="form-control me-2"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => updateCategory(cat.id)}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditCategoryId(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {cat.name}
                <span>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => {
                      setEditCategoryId(cat.id);
                      setEditCategoryName(cat.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    Delete
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* ---------- USER  ---------- */}
      <h4>Manage Users</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {stats.users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;



