import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, getCurrentUser } from '../services/authService';

const Login = ({ globalInstitution }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    if (!globalInstitution) {
      navigate('/');
    }
  }, [globalInstitution, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      
      // Fetch the user to determine their role and redirect appropriately
      const user = await getCurrentUser();
      if (user?.profile?.role === 'admin') {
        navigate('/users');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  if (!globalInstitution) return null;

  return (
    <div className="row justify-content-center align-items-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="col-md-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <h2 className="text-center mb-1 fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>Sign In to DDAS</h2>
            <p className="text-center text-primary mb-4 fw-semibold bg-primary bg-opacity-10 py-2 rounded-3 mt-3">
              <i className="bi bi-building me-2"></i>{globalInstitution.institution_name}
            </p>
            
            {message && <div className="alert alert-success border-0 shadow-sm">{message}</div>}
            {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold small text-uppercase" style={{ letterSpacing: '0.5px' }}>Email address</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg bg-light border-0 py-3 px-4 shadow-sm" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-5">
                <label className="form-label text-dark fw-semibold small text-uppercase" style={{ letterSpacing: '0.5px' }}>Password</label>
                <input 
                  type="password" 
                  className="form-control form-control-lg bg-light border-0 py-3 px-4 shadow-sm" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="Enter your password"
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm" 
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm" /> : 'Secure Sign In'}
              </button>
              
              <div className="text-center mt-4">
                <button type="button" className="btn btn-light text-muted btn-sm px-4 rounded-pill transition-all hover-bg-secondary" onClick={() => navigate('/')}>
                  <i className="bi bi-arrow-left me-1"></i> Change Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
