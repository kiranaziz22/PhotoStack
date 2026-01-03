import PhotoCard from './PhotoCard';
import './PhotoGrid.css';

const PhotoGrid = ({ photos, loading }) => {
  if (loading) {
    return (
      <div className="photo-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="photo-card skeleton">
            <div className="photo-image"><div className="photo-skeleton"></div></div>
            <div className="photo-info">
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!photos?.length) {
    return (
      <div className="empty-state">
        <i className="fas fa-camera"></i>
        <h3>No photos found</h3>
        <p>Be the first to share something amazing!</p>
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <PhotoCard key={photo._id} photo={photo} />
      ))}
    </div>
  );
};

export default PhotoGrid;
