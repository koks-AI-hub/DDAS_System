import React from 'react';

const StatCard = ({ title, value, iconClass, colorClass, suffix = "" }) => {
  return (
    <div className="col-md-4 col-sm-6 mb-4">
      <div className="card card-hover-up h-100 border-0 p-1">
        <div className="card-body d-flex flex-column justify-content-between p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="text-muted fw-semibold mb-0" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
              {title}
            </h6>
            <div className={`text-${colorClass} bg-${colorClass} bg-opacity-10 d-flex align-items-center justify-content-center rounded-circle`} style={{ width: '40px', height: '40px' }}>
              <i className={iconClass || 'bi bi-graph-up'} style={{ fontSize: '1.2rem' }}></i>
            </div>
          </div>
          <div>
            <h2 className="mb-0 fw-bold text-dark d-flex align-items-baseline gap-1">
              {value} {suffix && <span className="fs-6 text-muted fw-medium">{suffix}</span>}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
