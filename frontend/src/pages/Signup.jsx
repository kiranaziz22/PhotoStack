import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password, role, name);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <i className="fas fa-camera-retro"></i>
          <h1>Join PhotoStack</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Display Name</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="8"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div className="role-selector">
              <label className={`role-option ${role === 'consumer' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="consumer"
                  checked={role === 'consumer'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <i className="fas fa-eye"></i>
                <span>Consumer</span>
                <small>Browse & interact</small>
              </label>
              <label className={`role-option ${role === 'creator' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={role === 'creator'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <i className="fas fa-camera"></i>
                <span>Creator</span>
                <small>Upload photos</small>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner-sm"></span> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="btn btn-social">
          <i className="fab fa-microsoft"></i> Continue with Microsoft
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
