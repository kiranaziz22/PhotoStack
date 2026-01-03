import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { photoApi } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isCreator } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isCreator) {
      loadMyPhotos();
    } else {
      setLoading(false);
    }
  }, [user, isCreator]);

  const loadMyPhotos = async () => {
    try {
      // Use odId from database user object
      const creatorId = user.odId || user._id;
      console.log('Loading photos for creator:', creatorId);
      const res = await photoApi.getByCreator(creatorId);
      setPhotos(res.data || []);
    } catch (err) {
      console.error('Error loading by creator:', err);
      // Fallback: get all and filter by multiple possible IDs
      try {
        const allRes = await photoApi.getAll(1, 100);
        const myPhotos = (allRes.data || []).filter(p => {
          return p.creatorId === user.odId || 
                 p.creatorId === user._id ||
                 p.creatorId === user.email;
        });
        console.log('Fallback found photos:', myPhotos.length);
        setPhotos(myPhotos);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await photoApi.delete(photoId);
      setPhotos(photos.filter(p => p._id !== photoId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || !isCreator) {
    return (
      <div className="dashboard-page">
        <div className="access-denied">
          <i className="fas fa-lock"></i>
          <h2>Creator Access Required</h2>
        </div>
      </div>
    );
  }

  const totalViews = photos.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalRatings = photos.reduce((sum, p) => sum + (p.ratingCount || 0), 0);
  const avgRating = photos.length > 0 
    ? (photos.reduce((sum, p) => sum + (p.averageRating || 0), 0) / photos.length).toFixed(1)
    : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1><i className="fas fa-chart-bar"></i> Creator Dashboard</h1>
        <Link to="/upload" className="btn btn-primary">
          <i className="fas fa-plus"></i> New Photo
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <i className="fas fa-images"></i>
          <div>
            <span className="value">{photos.length}</span>
            <span className="label">Photos</span>
          </div>
        </div>
        <div className="stat-card blue">
          <i className="fas fa-eye"></i>
          <div>
            <span className="value">{totalViews.toLocaleString()}</span>
            <span className="label">Total Views</span>
          </div>
        </div>
        <div className="stat-card yellow">
          <i className="fas fa-star"></i>
          <div>
            <span className="value">{avgRating}</span>
            <span className="label">Avg Rating</span>
          </div>
        </div>
        <div className="stat-card green">
          <i className="fas fa-heart"></i>
          <div>
            <span className="value">{totalRatings}</span>
            <span className="label">Ratings</span>
          </div>
        </div>
      </div>

      <div className="photos-section">
        <h2>Your Photos</h2>
        
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : photos.length === 0 ? (
          <div className="empty">
            <i className="fas fa-camera"></i>
            <p>No photos yet. Upload your first photo!</p>
            <Link to="/upload" className="btn btn-primary">Upload</Link>
          </div>
        ) : (
          <div className="photos-table">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Title</th>
                  <th>Views</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {photos.map(photo => (
                  <tr key={photo._id}>
                    <td>
                      <img src={photo.blobUrl} alt={photo.title} className="thumb" />
                    </td>
                    <td>
                      <Link to={`/photo/${photo._id}`}>{photo.title}</Link>
                    </td>
                    <td>{photo.viewCount || 0}</td>
                    <td>
                      <span className="rating">
                        <i className="fas fa-star"></i> {(photo.averageRating || 0).toFixed(1)}
                      </span>
                    </td>
                    <td>{new Date(photo.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDelete(photo._id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
