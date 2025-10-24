
import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';  

const Profile = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [newPic, setNewPic] = useState(null);


  // -----------------User/Author Information--------
  useEffect(() => {
    API.get('auth/me/')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load profile.'));
  }, []);
// ----------------Update A Profile Picture--------------
  const handleUpload = async () => {
    if (!newPic) {
      toast.warning('Please select a picture first.');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', newPic);

    try {
      const res = await API.put('auth/me/update-profile-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData({ ...data, profile_picture: res.data.profile_picture });
      setNewPic(null);
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile picture.'); 
    }
  };

  if (!data) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Profile</h2>
      {data.profile_picture && (
        <img
          src={`http://127.0.0.1:8000${data.profile_picture}`}
          alt="profile"
          className="img-thumbnail mb-3"
          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
        />
      )}
      <p><b>Username:</b> {data.username}</p>
      <p><b>Email:</b> {data.email}</p>

      <div className="mt-3">
        <input type="file" onChange={e => setNewPic(e.target.files[0])} />
        <button className="btn btn-primary ms-2" onClick={handleUpload}>
          Update Profile Picture
        </button>
      </div>
    </div>
  );
};

export default Profile;
