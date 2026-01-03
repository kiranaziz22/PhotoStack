import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isCreator } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <i className="fas fa-camera-retro"></i>
          <span>PhotoStack</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="nav-actions">
          <Link to="/" className="nav-link"><i className="fas fa-home"></i></Link>
          <Link to="/explore" className="nav-link"><i className="fas fa-compass"></i></Link>
          
          {user ? (
            <>
              {isCreator && (
                <Link to="/upload" className="nav-link upload-btn">
                  <i className="fas fa-plus-square"></i>
                </Link>
              )}
              <div className="user-menu">
                <button className="avatar-btn" onClick={() => setShowDropdown(!showDropdown)}>
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'U')}&background=6366f1&color=fff`} 
                    alt={user.displayName || user.name} 
                  />
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user.displayName || user.name}</strong>
                      <small>{user.role}</small>
                    </div>
                    <Link to="/profile" onClick={() => setShowDropdown(false)}>
                      <i className="fas fa-user"></i> Profile
                    </Link>
                    {isCreator && (
                      <Link to="/dashboard" onClick={() => setShowDropdown(false)}>
                        <i className="fas fa-chart-bar"></i> Dashboard
                      </Link>
                    )}
                    <hr />
                    <button onClick={() => { logout(); setShowDropdown(false); }}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Log In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
