import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { userApi } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, isCreator } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const res = await userApi.getStats();
      setStats(res.data || res);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="not-logged-in">
          <i className="fas fa-user-circle"></i>
          <h2>Please log in</h2>
          <Link to="/login" className="btn btn-primary">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img 
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}&background=6366f1&color=fff&size=120`}
          alt={user.displayName || user.name}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h1>{user.displayName || user.name || 'User'}</h1>
          <span className={`role-badge ${user.role}`}>
            <i className={`fas fa-${isCreator ? 'camera' : 'eye'}`}></i>
            {user.role}
          </span>
          <p>{user.email}</p>
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <i className="fas fa-images"></i>
          <span className="stat-value">{stats?.photoCount ?? user.photoCount ?? 0}</span>
          <span className="stat-label">Photos</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-eye"></i>
          <span className="stat-value">{stats?.totalViews ?? user.totalViews ?? 0}</span>
          <span className="stat-label">Views</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-comment"></i>
          <span className="stat-value">{stats?.commentCount ?? user.commentCount ?? 0}</span>
          <span className="stat-label">Comments</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-star"></i>
          <span className="stat-value">{stats?.totalRatings ?? stats?.ratingCount ?? user.ratingCount ?? 0}</span>
          <span className="stat-label">Ratings</span>
        </div>
      </div>

      {isCreator && (
        <div className="profile-actions">
          <Link to="/upload" className="btn btn-primary">
            <i className="fas fa-upload"></i> Upload Photo
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            <i className="fas fa-chart-bar"></i> Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
