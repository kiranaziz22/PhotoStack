import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { photoApi, commentApi, ratingApi } from '../services/api';
import StarRating from '../components/StarRating';
import './PhotoDetail.css';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState({ average: 0, total: 0 });
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhoto();
  }, [id]);

  const loadPhoto = async () => {
    try {
      const [photoRes, commentsRes, ratingsRes] = await Promise.all([
        photoApi.getById(id),
        commentApi.getByPhoto(id),
        ratingApi.getByPhoto(id)
      ]);
      setPhoto(photoRes.data);
      setComments(commentsRes.data || []);
      setRatings(ratingsRes.data || { average: 0, total: 0 });
      
      if (user) {
        try {
          const myRating = await ratingApi.getUserRating(id);
          setUserRating(myRating.data?.value || 0);
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (value) => {
    if (!user) return navigate('/login');
    try {
      await ratingApi.rate(id, value);
      setUserRating(value);
      const ratingsRes = await ratingApi.getByPhoto(id);
      setRatings(ratingsRes.data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!newComment.trim()) return;
    
    try {
      const res = await commentApi.create(id, newComment);
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="photo-detail loading"><div className="spinner"></div></div>;
  }

  if (!photo) {
    return <div className="photo-detail not-found"><h2>Photo not found</h2></div>;
  }

  return (
    <div className="photo-detail">
      <div className="photo-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <img src={photo.blobUrl} alt={photo.title} className="main-image" />
      </div>
      
      <div className="photo-sidebar">
        <div className="photo-header">
          <h1>{photo.title}</h1>
          {photo.location && (
            <span className="location">
              <i className="fas fa-map-marker-alt"></i> {photo.location}
            </span>
          )}
        </div>

        {photo.caption && <p className="caption">{photo.caption}</p>}

        {/* AI Tags */}
        {photo.aiTags?.length > 0 && (
          <div className="tags-section">
            <h4><i className="fas fa-robot"></i> AI Tags</h4>
            <div className="tags">
              {photo.aiTags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="rating-section">
          <div className="rating-display">
            <StarRating value={ratings.average} readonly size="lg" />
            <span>({ratings.total} ratings)</span>
          </div>
          {user && (
            <div className="your-rating">
              <span>Your rating:</span>
              <StarRating value={userRating} onChange={handleRate} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="photo-stats">
          <div className="stat"><i className="fas fa-eye"></i> {photo.viewCount || 0} views</div>
          <div className="stat"><i className="fas fa-comment"></i> {comments.length} comments</div>
        </div>

        {/* Comments */}
        <div className="comments-section">
          <h3>Comments</h3>
          
          {user && (
            <form onSubmit={handleComment} className="comment-form">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={!newComment.trim()}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          )}

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment._id} className="comment">
                <img 
                  src={`https://ui-avatars.com/api/?name=${comment.userDisplayName}&size=32`} 
                  alt="" 
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <strong>{comment.userDisplayName}</strong>
                    {comment.sentiment && comment.sentiment !== 'unknown' && (
                      <span className={`sentiment ${comment.sentiment}`}>
                        {comment.sentiment === 'positive' && '😊'}
                        {comment.sentiment === 'neutral' && '😐'}
                        {comment.sentiment === 'negative' && '😞'}
                      </span>
                    )}
                  </div>
                  <p>{comment.content}</p>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="no-comments">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
