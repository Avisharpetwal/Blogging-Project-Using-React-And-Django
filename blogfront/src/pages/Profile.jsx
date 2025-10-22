import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [newPic, setNewPic] = useState(null);

  useEffect(() => {
    API.get('auth/me/').then(res => setData(res.data));
  }, []);

  const handleUpload = async () => {
    if (!newPic) return;
    const formData = new FormData();
    formData.append('profile_picture', newPic);

    try {
      const res = await API.put('auth/me/update-profile-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData({ ...data, profile_picture: res.data.profile_picture });
      setNewPic(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Profile</h2>
      {data.profile_picture && (
        <img src={`http://127.0.0.1:8000${data.profile_picture}`} alt="profile" className="img-thumbnail mb-3" />
      )}
      <p><b>Username:</b> {data.username}</p>
      <p><b>Email:</b> {data.email}</p>

      <div className="mt-3">
        <input type="file" onChange={e => setNewPic(e.target.files[0])} />
        <button className="btn btn-primary ms-2" onClick={handleUpload}>Update Profile Picture</button>
      </div>
    </div>
  );
};

export default Profile;
