import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { photoApi } from '../services/api';
import './Upload.css';

const Upload = () => {
  const { user, isCreator } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!user || !isCreator) {
    return (
      <div className="upload-page">
        <div className="access-denied">
          <i className="fas fa-lock"></i>
          <h2>Creator Access Required</h2>
          <p>Only creators can upload photos</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', title);
      formData.append('caption', caption);
      formData.append('location', location);
      formData.append('people', people);

      await photoApi.create(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1><i className="fas fa-cloud-upload-alt"></i> Upload Photo</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div 
            className={`dropzone ${preview ? 'has-preview' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="preview-image" />
            ) : (
              <div className="dropzone-content">
                <i className="fas fa-image"></i>
                <p>Drag & drop or click to upload</p>
                <span>Supports JPG, PNG, GIF, WebP</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              hidden
            />
          </div>

          {preview && (
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => { setFile(null); setPreview(null); }}
            >
              <i className="fas fa-times"></i> Remove
            </button>
          )}

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your photo a title"
              required
            />
          </div>

          <div className="form-group">
            <label>Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell the story behind this photo..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><i className="fas fa-map-marker-alt"></i> Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was this taken?"
              />
            </div>

            <div className="form-group">
              <label><i className="fas fa-users"></i> People</label>
              <input
                type="text"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                placeholder="Tag people (comma separated)"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg btn-block"
            disabled={!file || !title || uploading}
          >
            {uploading ? (
              <><span className="spinner-sm"></span> Uploading...</>
            ) : (
              <><i className="fas fa-upload"></i> Upload Photo</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
