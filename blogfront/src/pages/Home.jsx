

import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('newest'); 

  const blogsPerPage = 9;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await API.get('categories/');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const { data } = await API.get('blogs/');
      setBlogs(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, []);

  // Filtered blogs by category & search
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory
      ? blog.category && blog.category.id === selectedCategory
      : true;
    const matchesSearch = blog.title.toLowerCase().includes(debouncedQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorted blogs
  let sortedBlogs = [...filteredBlogs];
  switch(sortOrder) {
    case 'newest':
      sortedBlogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'oldest':
      sortedBlogs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'az':
      sortedBlogs.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'za':
      sortedBlogs.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      break;
  }

  // Pagination
  const totalPages = Math.ceil(sortedBlogs.length / blogsPerPage);
  const startIndex = (page - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const displayedBlogs = sortedBlogs.slice(startIndex, endIndex);

  // Navigate to blog detail
  const handleReadMore = (blogId) => {
    if (user) {
      navigate(`/blogs/${blogId}`);
    } else {
      navigate(`/login?next=/blogs/${blogId}`);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-3">
          {user && (
            <button
              className="btn btn-success mb-3 w-100"
              onClick={() => navigate('/blogs/new')}
            >
              Add Blog
            </button>
          )}
          <Sidebar
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        <div className="col-md-9">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search blogs by title..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Sort Blogs:</label>
            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest → Oldest</option>
              <option value="oldest">Oldest → Newest</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          {displayedBlogs.length === 0 ? (
            <p>No blogs found.</p>
          ) : (
            displayedBlogs.map(blog => (
              <div key={blog.id} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{blog.title}</h5>
                  <p className="card-text">By {blog.author.username}</p>
                  <p>Likes: {blog.likes_count}</p>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleReadMore(blog.id)}
                  >
                    Read More
                  </button>

                  {user && blog.author.id === user.id && (
                    <>
                      <button
                        className="btn btn-warning btn-sm ms-2"
                        onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm ms-2"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
