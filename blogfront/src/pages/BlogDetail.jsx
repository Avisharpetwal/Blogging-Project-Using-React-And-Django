import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const fetchBlog = async () => {
    if (id === 'new') return; // Prevent fetching on "new"
    try {
      const { data } = await API.get(`blogs/${id}/`);
      setBlog(data);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching blog:', err);
    }
  };

  useEffect(() => { fetchBlog(); }, [id]);

  const handleComment = async () => {
    if (!commentText) return;
    try {
      const { data } = await API.post(`blogs/${id}/comments/`, { comment: commentText });
      setComments([...comments, data]);
      setCommentText('');
    } catch (err) { console.error(err); }
  };

  const handleLike = async () => {
    try {
      await API.post(`blogs/${id}/like-toggle/`);
      fetchBlog();
    } catch (err) { console.error(err); }
  };

  if (!blog) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>{blog.title}</h2>
      <p>By {blog.author.username}</p>
      {blog.image && <img src={`http://127.0.0.1:8000${blog.image}`} className="img-fluid mb-3" alt={blog.title} />}
      <p>{blog.content}</p>
      <p>Category: {blog.category?.name}</p>
      <p>
        Likes: {blog.likes_count}{' '}
        <button className="btn btn-sm btn-primary" onClick={handleLike}>👍Like</button>
        {user && blog.author.id === user.id && (
          <button className="btn btn-warning btn-sm ms-2" onClick={() => navigate(`/blogs/edit/${blog.id}`)}>Edit Blog</button>
        )}
      </p>

      <hr />
      <h4>Comments</h4>
      {comments.map(c => <div key={c.id}><b>{c.author.username}</b>: {c.comment}</div>)}
      <div className="mt-2">
        <input type="text" className="form-control" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment" />
        <button className="btn btn-primary mt-2" onClick={handleComment}>Comment</button>
      </div>
    </div>
  );
};

export default BlogDetail;


















