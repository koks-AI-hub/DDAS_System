import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/authService';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light font-sans">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-gradient sticky-top shadow">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">DDAS</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              {user && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`} to="/upload">Upload</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === '/repository' ? 'active' : ''}`} to="/repository">Repository</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === '/logs' ? 'active' : ''}`} to="/logs">Logs</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === '/energy' ? 'active' : ''}`} to="/energy">Energy Analytics</Link>
                  </li>
                  {user?.profile?.role === 'admin' && (
                    <li className="nav-item ms-lg-3 border-start ps-lg-3 border-secondary d-none d-lg-block"></li>
                  )}
                  {user?.profile?.role === 'admin' && (
                    <li className="nav-item">
                      <Link className={`nav-link text-warning ${location.pathname === '/users' ? 'active fw-bold' : ''}`} to="/users">
                        <i className="bi bi-people me-1"></i> Users
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
            {user && (
              <div className="d-flex align-items-center text-white ms-lg-auto">
                <div className="d-none d-md-block me-3 text-end">
                  <small className="d-block text-white-50 lh-1">Welcome back,</small>
                  <span className="fw-semibold">{user.profile?.name || user.email.split('@')[0]}</span>
                </div>
                <div className="d-flex align-items-center bg-dark bg-opacity-50 rounded-pill p-1 border border-secondary border-opacity-50 shadow-sm">
                  <span className="px-3 small text-white-50 d-none d-lg-block border-end border-secondary border-opacity-50">{user.email}</span>
                  <button 
                    className="btn btn-sm btn-outline-danger rounded-pill border-0 px-3 fw-medium d-flex align-items-center gap-2" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container flex-grow-1 my-4 animate-fade-in">
        {children}
      </main>

      <footer className="footer mt-auto py-3 bg-white border-top text-center text-muted">
        <div className="container">
          <small>Data Download Duplication Alert System &copy; {new Date().getFullYear()}</small>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
