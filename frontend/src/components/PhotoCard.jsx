import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PhotoCard.css';

const PhotoCard = ({ photo }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link to={`/photo/${photo._id}`} className="photo-card">
      <div className="photo-image">
        {!loaded && <div className="photo-skeleton"></div>}
        <img 
          src={photo.blobUrl} 
          alt={photo.title}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
        <div className="photo-overlay">
          <div className="photo-stats">
            <span><i className="fas fa-heart"></i> {photo.ratingCount || 0}</span>
            <span><i className="fas fa-comment"></i> {photo.commentCount || 0}</span>
          </div>
        </div>
      </div>
      <div className="photo-info">
        <h3>{photo.title}</h3>
        {photo.location && (
          <span className="photo-location">
            <i className="fas fa-map-marker-alt"></i> {photo.location}
          </span>
        )}
      </div>
      {photo.aiTags?.length > 0 && (
        <div className="photo-tags">
          {photo.aiTags.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
};

export default PhotoCard;
