import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { calculateFileHash } from '../utils/hashUtils';
import { checkDuplicate, insertDatasetMetadata, logEnergySavings, logDownload } from '../services/dbService';
import { uploadFile } from '../services/storageService';
import { calculateSavings } from '../utils/energyUtils';

const UploadDataset = ({ user }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [hashProgress, setHashProgress] = useState('');
  
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStatus({ type: '', message: '' });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
      'application/pdf': ['.pdf']
    }
  });

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setStatus({ type: 'info', message: 'Analyzing file and generating hash...' });
    setHashProgress('0%');
    
    try {
      // 1. Generate SHA256 Hash
      const hashValue = await calculateFileHash(file);
      setHashProgress('100%');
      setStatus({ type: 'info', message: 'Checking for duplicates...' });
      
      // 2. Query database for existing hash
      const duplicate = await checkDuplicate(hashValue, user?.profile?.institution_id);
      
      if (duplicate) {
        // Handle Duplicate
        setStatus({ 
          type: 'warning', 
          message: 'Dataset already exists in the repository. Redirecting to existing dataset...' 
        });
        
        // Log the download attempt that was prevented
        await logDownload({
          dataset_id: duplicate.id,
          user_id: user.id,
          duplicate_detected: true,
          download_source: 'external'
        });
        
        // Calculate and log energy savings
        const savings = calculateSavings(file.size);
        await logEnergySavings({
          dataset_id: duplicate.id,
          energy_saved_kwh: savings.energySavedKwh,
          bandwidth_saved_mb: savings.bandwidthSavedMb,
          co2_reduction: savings.co2ReductionKg
        });
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/repository');
        }, 3000);
        
      } else {
        // Handle New Dataset
        setStatus({ type: 'info', message: 'Uploading to secure storage...' });
        
        // Generate unique storage path
        const fileExt = file.name.split('.').pop();
        const fileNameWithoutExt = file.name.replace(`.${fileExt}`, '');
        const storagePath = `${fileNameWithoutExt}_${Date.now()}.${fileExt}`;
        
        // Upload to Supabase Storage
        await uploadFile(file, storagePath);
        
        setStatus({ type: 'info', message: 'Saving metadata...' });
        
        // Save metadata to DB
        await insertDatasetMetadata({
          file_name: file.name,
          file_size: file.size,
          hash_value: hashValue,
          storage_path: storagePath,
          uploaded_by: user.id,
          institution_id: user?.profile?.institution_id
        });
        
        setStatus({ type: 'success', message: 'Dataset uploaded successfully.' });
        setFile(null);
      }
      
    } catch (error) {
      console.error('Upload process failed:', error);
      setStatus({ type: 'danger', message: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center animate-fade-in">
      <div className="col-lg-8 col-xl-7 mt-4">
        <h2 className="mb-4 fw-bold text-dark text-center" style={{ letterSpacing: '-0.5px' }}>Upload Dataset</h2>
        <div className="card shadow-md border-0 mb-5">
          <div className="card-body p-4 p-md-5">
            
            {status.message && (
              <div className={`alert alert-${status.type} d-flex align-items-center border-0 shadow-sm rounded-3 mb-4`}>
                {status.type === 'info' && loading && (
                  <div className="spinner-border spinner-border-sm me-3" role="status" />
                )}
                <span className="fw-medium">{status.message}</span>
              </div>
            )}
            
            <div 
              {...getRootProps()} 
              className={`p-5 mb-4 text-center rounded-4 transition-all ${isDragActive ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light border-secondary text-muted'}`}
              style={{ borderStyle: 'dashed', borderWidth: '2px', cursor: 'pointer' }}
            >
              <input {...getInputProps()} />
              <div className={`mb-3 transition-transform ${isDragActive ? 'scale-110' : ''}`}>
                <i className={`bi bi-cloud-arrow-up display-3 ${isDragActive ? 'text-primary' : 'text-secondary opacity-50'}`}></i>
              </div>
              {isDragActive ? (
                <p className="fs-5 fw-semibold text-primary mb-0">Drop the file here ...</p>
              ) : (
                <>
                  <p className="fs-5 fw-medium text-dark mb-2">Drag & drop a dataset file here, or click to select</p>
                  <p className="small mb-0 opacity-75">Supports CSV, JSON, XLSX, ZIP, and PDF archives</p>
                </>
              )}
            </div>

            {file && (
              <div className="d-flex justify-content-between align-items-center p-3 bg-white border border-secondary border-opacity-25 rounded-3 mb-4 shadow-sm animate-fade-in">
                <div className="d-flex align-items-center">
                  <div className="bg-light p-2 rounded-circle me-3 text-primary">
                    <i className="bi bi-file-earmark-data fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-1 fw-bold text-dark text-break">{file.name}</h6>
                    <small className="text-muted fw-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</small>
                  </div>
                </div>
                <button className="btn btn-light text-danger rounded-circle p-2" onClick={(e) => { e.stopPropagation(); setFile(null); }} disabled={loading}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            )}

            <button 
              className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm" 
              onClick={handleUpload}
              disabled={!file || loading}
              style={{ letterSpacing: '0.5px' }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" /> Processing...</>
              ) : (
                <><i className="bi bi-shield-check me-2"></i> Upload & Verify</>
              )}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDataset;
