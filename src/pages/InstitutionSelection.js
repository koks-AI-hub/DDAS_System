import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstitutions } from '../services/authService';

const InstitutionSelection = ({ setGlobalInstitution }) => {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await getInstitutions();
        setInstitutions(data || []);
      } catch (err) {
        setError('Failed to load institutions: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstitutions();
  }, []);

  const handleContinue = () => {
    if (!selectedInstitutionId) {
      setError('Please select an institution to continue.');
      return;
    }
    const selectedInst = institutions.find(i => i.id === selectedInstitutionId);
    setGlobalInstitution(selectedInst);
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register-institution');
  };

  return (
    <div className="row justify-content-center align-items-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="col-md-6 col-lg-5 mt-4">
        <div className="card shadow-lg border-0 rounded-4 mb-5">
          <div className="card-body p-5">
            <h2 className="text-center mb-2 fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>Welcome to DDAS</h2>
            <p className="text-center text-muted mb-4 fs-6">
              Please select your institution to continue.
            </p>

            {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="form-label text-dark fw-semibold small text-uppercase" style={{ letterSpacing: '0.5px' }}>Select Institution</label>
                  <select 
                    className="form-select form-select-lg bg-light border-0 py-3 shadow-sm cursor-pointer"
                    value={selectedInstitutionId}
                    onChange={(e) => {
                      setSelectedInstitutionId(e.target.value);
                      setError(null);
                    }}
                  >
                    <option value="">-- Choose Institution --</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.institution_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-grid gap-3 mt-5">
                  <button 
                    className="btn btn-primary btn-lg fw-bold py-3 shadow-sm" 
                    onClick={handleContinue}
                  >
                    Continue to Login
                  </button>
                  <div className="text-center text-muted small fw-semibold text-uppercase my-1" style={{ letterSpacing: '2px' }}>OR</div>
                  <button 
                    className="btn btn-light text-primary border border-primary border-opacity-25 btn-lg fw-bold py-3 transition-all hover-bg-primary-light" 
                    onClick={handleRegister}
                  >
                    Register New Institution
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionSelection;
