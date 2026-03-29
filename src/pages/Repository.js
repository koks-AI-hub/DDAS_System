import React, { useState, useEffect } from 'react';
import { getDatasets, logDownload, hasDownloadedBefore, logEnergySavings } from '../services/dbService';
import { downloadFile } from '../services/storageService';
import { getCurrentUser } from '../services/authService';
import { calculateSavings } from '../utils/energyUtils';

const Repository = ({ user }) => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadState, setDownloadState] = useState({ id: null, status: 'idle', message: '' });

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const data = await getDatasets(currentUser?.profile?.institution_id);
      setDatasets(data);
    } catch (err) {
      setError('Failed to fetch datasets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (dataset) => {
    let timeoutId = null;
    try {
      setDownloadState({ id: dataset.id, status: 'loading', message: '' });
      
      // 1. Check if user has already downloaded this dataset
      const alreadyDownloaded = await hasDownloadedBefore(dataset.id, user.id);
      
      if (alreadyDownloaded) {
        // Alert the user that they already have it
        alert("You have already downloaded this dataset. It should be in your local Downloads folder. To save energy and bandwidth, we will not download it again.");
        
        // Log the prevented download
        await logDownload({
          dataset_id: dataset.id,
          user_id: user.id,
          duplicate_detected: true,
          download_source: 'local'
        });
        
        // Calculate and log energy savings
        const savings = calculateSavings(dataset.file_size);
        await logEnergySavings({
          dataset_id: dataset.id,
          energy_saved_kwh: savings.energySavedKwh,
          bandwidth_saved_mb: savings.bandwidthSavedMb,
          co2_reduction: savings.co2ReductionKg
        });
        
        setDownloadState({ id: null, status: 'idle', message: '' });
        return;
      }

      // 2. Not downloaded before, proceed to log external download
      await logDownload({
        dataset_id: dataset.id,
        user_id: user.id,
        duplicate_detected: false,
        download_source: 'external'
      });
      
      // Setup the timeout detection
      timeoutId = setTimeout(() => {
        setDownloadState(prev => prev.id === dataset.id ? { 
          ...prev, 
          status: 'warning', 
          message: 'Download is taking longer than expected. Please check your network.' 
        } : prev);
      }, 10000);

      // 3. Download the file using Blob
      const blob = await downloadFile(dataset.storage_path);
      
      // Clear timeout since it succeeded
      clearTimeout(timeoutId);
      
      // 4. Trigger download in browser
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = dataset.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Reset state on success
      setDownloadState({ id: null, status: 'idle', message: '' });
      
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      setDownloadState({ 
        id: dataset.id, 
        status: 'error', 
        message: 'Download failed. Please try again.' 
      });
      console.error('Error downloading file:', err);
    }
  };

  const formatSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Dataset Repository</h2>
          <p className="text-muted mb-0">Browse, manage, and download all synchronized research data.</p>
        </div>
        <button className="btn btn-outline-primary shadow-sm d-flex align-items-center gap-2 px-3" onClick={fetchDatasets}>
          <i className="bi bi-arrow-clockwise"></i> Refresh List
        </button>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                <tr>
                  <th className="py-3 px-4 border-0 text-muted fw-bold">Dataset Name</th>
                  <th className="border-0 text-muted fw-bold">File Size</th>
                  <th className="border-0 text-muted fw-bold">Upload Date</th>
                  <th className="text-end px-4 border-0 text-muted fw-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {datasets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center justify-content-center py-4">
                        <i className="bi bi-inbox fs-1 text-secondary mb-3 opacity-50"></i>
                        <p className="mb-0 fs-5">No datasets found in the repository.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  datasets.map((ds) => (
                    <tr key={ds.id}>
                      <td className="px-4 fw-medium text-dark">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded">
                            <i className="bi bi-file-earmark-text"></i>
                          </div>
                          {ds.file_name}
                        </div>
                      </td>
                      <td className="text-muted">{formatSize(ds.file_size)}</td>
                      <td className="text-muted">{new Date(ds.created_at).toLocaleDateString()}</td>
                      <td className="text-end px-4">
                        <div className="d-flex flex-column align-items-end gap-2">
                          <button 
                            className={`btn btn-sm rounded-pill px-4 fw-medium shadow-sm transition-all ${
                              downloadState.id === ds.id && downloadState.status === 'error' 
                                ? 'btn-danger' 
                                : 'btn-outline-primary'
                            }`}
                            onClick={() => handleDownload(ds)}
                            disabled={downloadState.id === ds.id && (downloadState.status === 'loading' || downloadState.status === 'warning')}
                          >
                            {downloadState.id === ds.id && (downloadState.status === 'loading' || downloadState.status === 'warning') ? (
                              <div className="d-flex align-items-center gap-2">
                                <span className="spinner-border spinner-border-sm" /> Downloading...
                              </div>
                            ) : downloadState.id === ds.id && downloadState.status === 'error' ? (
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-arrow-clockwise"></i> Retry
                              </div>
                            ) : (
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-cloud-download"></i> Download
                              </div>
                            )}
                          </button>
                          
                          {downloadState.id === ds.id && downloadState.message && (
                            <div className="mt-1 small fw-medium" style={{ maxWidth: '250px', textAlign: 'right', lineHeight: '1.2', color: downloadState.status === 'error' ? '#dc3545' : '#d97706' }}>
                              {downloadState.status === 'warning' && <i className="bi bi-exclamation-triangle me-1"></i>}
                              {downloadState.status === 'error' && <i className="bi bi-x-circle me-1"></i>}
                              {downloadState.message}
                            </div>
                          )}
                        </div>
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

export default Repository;
