import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerInstitution } from '../services/authService';

const RegisterInstitution = ({ setGlobalInstitution }) => {
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionEmail: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { institution } = await registerInstitution({
        institutionName: formData.institutionName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        password: formData.password
      });

      // Set global institution and redirect to login
      setGlobalInstitution(institution);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.message || 'Failed to register institution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center py-5">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <h2 className="text-center mb-4 fw-bold">Register Institution</h2>
            <p className="text-center text-muted mb-4">
              Create a new institution and admin account.
            </p>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleRegister}>
              <h5 className="mb-3 border-bottom pb-2">Institution Details</h5>
              <div className="mb-3">
                <label className="form-label text-muted fw-semibold">Institution Name</label>
                <input 
                  type="text" 
                  className="form-control bg-light" 
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  required 
                  placeholder="e.g. Acme University"
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted fw-semibold">Institution Email</label>
                <input 
                  type="email" 
                  className="form-control bg-light" 
                  name="institutionEmail"
                  value={formData.institutionEmail}
                  onChange={handleChange}
                  required 
                  placeholder="admin@institution.edu"
                />
              </div>

              <h5 className="mb-3 mt-4 border-bottom pb-2">Admin Account Details</h5>
              <div className="mb-3">
                <label className="form-label text-muted fw-semibold">Admin Full Name</label>
                <input 
                  type="text" 
                  className="form-control bg-light" 
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required 
                  placeholder="John Doe"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted fw-semibold">Admin Authentication Email</label>
                <input 
                  type="email" 
                  className="form-control bg-light" 
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required 
                  placeholder="john.doe@institution.edu"
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted fw-semibold">Password</label>
                  <input 
                    type="password" 
                    className="form-control bg-light" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                    placeholder="Create a password"
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label text-muted fw-semibold">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control bg-light" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required 
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 fw-bold mt-2" 
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Institution'}
              </button>
              
              <div className="text-center mt-4">
                <button type="button" className="btn btn-link text-decoration-none" onClick={() => navigate('/')}>
                  Back to Selection
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterInstitution;
