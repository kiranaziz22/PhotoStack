import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PhotoGrid from '../components/PhotoGrid';
import { photoApi, userApi } from '../services/api';
import './Home.css';

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [photosRes, trendingRes, creatorsRes] = await Promise.all([
        photoApi.getAll(1, 12),
        photoApi.getTrending(),
        userApi.getCreators()
      ]);
      setPhotos(photosRes.data);
      setTrending(trendingRes.data);
      setCreators(creatorsRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Share Your <span className="gradient-text">Moments</span></h1>
          <p>Discover amazing photos from creators around the world</p>
          <div className="hero-buttons">
            <Link to="/explore" className="btn btn-primary btn-lg">
              <i className="fas fa-compass"></i> Explore
            </Link>
            <Link to="/signup" className="btn btn-glass btn-lg">
              <i className="fas fa-user-plus"></i> Join Now
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-cards">
            {trending.slice(0, 3).map((photo, i) => (
              <div key={photo._id} className={`float-card card-${i + 1}`}>
                <img src={photo.blobUrl} alt={photo.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-fire"></i> Trending</h2>
            <Link to="/explore?sort=trending" className="see-all">See All →</Link>
          </div>
          <div className="trending-scroll">
            {trending.map(photo => (
              <Link to={`/photo/${photo._id}`} key={photo._id} className="trending-card">
                <img src={photo.blobUrl} alt={photo.title} />
                <div className="trending-info">
                  <span>{photo.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Photos */}
      <section className="section">
        <div className="section-header">
          <h2><i className="fas fa-images"></i> Latest Photos</h2>
          <Link to="/explore" className="see-all">View All →</Link>
        </div>
        <PhotoGrid photos={photos} loading={loading} />
      </section>

      {/* Featured Creators */}
      {creators.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-star"></i> Featured Creators</h2>
          </div>
          <div className="creators-grid">
            {creators.slice(0, 6).map(creator => (
              <Link to={`/creator/${creator._id}`} key={creator._id} className="creator-card">
                <img 
                  src={`https://ui-avatars.com/api/?name=${creator.displayName}&background=6366f1&color=fff&size=80`} 
                  alt={creator.displayName} 
                />
                <h4>{creator.displayName}</h4>
                <span>{creator.photoCount || 0} photos</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
