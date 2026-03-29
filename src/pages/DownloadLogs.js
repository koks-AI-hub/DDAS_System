import React, { useState, useEffect } from 'react';
import { getDownloads } from '../services/dbService';
import { getCurrentUser } from '../services/authService';

const DownloadLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const data = await getDownloads(currentUser?.profile?.institution_id);
      setLogs(data);
    } catch (err) {
      setError('Failed to fetch download logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Download History</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchLogs}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th>Dataset</th>
                  {/* <th>User ID</th> */}
                  <th>Source</th>
                  <th className="text-end px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      No download history recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 text-muted">
                        {new Date(log.requested_at).toLocaleString()}
                      </td>
                      <td className="fw-semibold">
                        {log.datasets?.file_name || 'Unknown Dataset'}
                      </td>
                      <td>
                        <span className={`badge bg-${log.download_source === 'local' ? 'info' : 'secondary'}`}>
                          {log.download_source.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        {log.duplicate_detected ? (
                          <span className="badge bg-warning text-dark px-2 border border-warning rounded-pill">
                            <i className="bi bi-shield-check me-1"></i> Duplicate Prevented
                          </span>
                        ) : (
                          <span className="badge bg-success px-2 border border-success rounded-pill">
                            <i className="bi bi-check-circle me-1"></i> Downloaded
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

export default DownloadLogs;
