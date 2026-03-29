import React, { useState, useEffect } from 'react';
import { fetchInstitutionUsers, deleteUserRecord } from '../services/dbService';
import { createInstitutionUser, getCurrentUser } from '../services/authService';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUser();
      if (!currentUser?.profile) throw new Error("Could not fetch current user profile");
      setCurrentUserProfile(currentUser.profile);

      const data = await fetchInstitutionUsers(currentUser.profile.institution_id);
      setUsers(data || []);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    try {
      await createInstitutionUser({
        ...formData,
        institutionId: currentUserProfile.institution_id
      });
      
      // Reset form and reload list
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
      await loadUsers();
      
    } catch (err) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName}? This will revoke their access to this institution.`)) {
      return;
    }
    
    try {
      setActionLoading(true);
      await deleteUserRecord(userId, currentUserProfile.institution_id);
      await loadUsers();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">User Management</h2>
          <p className="text-muted mb-0">Manage access for {currentUserProfile?.institutions?.institution_name}</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <i className={`bi bi-${showAddForm ? 'x-circle' : 'person-plus'} me-2`}></i>
          {showAddForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showAddForm && (
        <div className="card shadow-sm border-0 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="card-title fw-bold mb-3 border-bottom pb-2">Add New Institution User</h5>
            {formError && <div className="alert alert-danger py-2">{formError}</div>}
            
            <form onSubmit={handleAddUser}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted fw-semibold">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted fw-semibold">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted fw-semibold">Temporary Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                    minLength="6"
                  />
                  <small className="text-muted">Minimum 6 characters</small>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label text-muted fw-semibold">Role</label>
                  <select 
                    className="form-select" 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="btn btn-success px-4 fw-bold"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No users found in this institution.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 fw-semibold text-dark">
                        <i className={`bi bi-person-circle fs-5 me-2 ${(u.role || 'user') === 'admin' ? 'text-primary' : 'text-secondary'}`}></i>
                        {u.name}
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge bg-${(u.role || 'user') === 'admin' ? 'primary' : 'secondary'} px-2 rounded-pill`}>
                          {(u.role || 'user').toUpperCase()}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="text-end px-4">
                        {u.id !== currentUserProfile?.id ? (
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-trash3 me-1"></i> Remove
                          </button>
                        ) : (
                          <span className="badge bg-light text-muted border px-3 py-2 rounded-pill">
                            Current User
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
