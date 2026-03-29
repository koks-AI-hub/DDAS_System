import React, { useState, useEffect } from 'react';
import { getEnergyLogs, getDashboardStats } from '../services/dbService';
import StatCard from '../components/StatCard';
import ChartWidget from '../components/ChartWidget';
import { getCurrentUser } from '../services/authService';

const EnergyAnalytics = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        const instId = currentUser?.profile?.institution_id;
        const [logsData, statsData] = await Promise.all([
          getEnergyLogs(instId),
          getDashboardStats(instId)
        ]);
        setLogs(logsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching energy data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-success" /></div>;
  if (!stats) return <div className="alert alert-danger">Failed to load energy stats</div>;

  // Chart data setup based on real DB totals logic
  const impactChartData = {
    labels: ['Energy (kWh)', 'CO₂ (kg)', 'Data (MB)'],
    datasets: [
      {
        label: 'Total Impact',
        data: [stats.totalEnergySaved, stats.totalCo2Reduced, stats.totalBandwidthSaved],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', 
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold text-success"><i className="bi bi-leaf me-2"></i>Energy Impact Analytics</h2>
      
      <div className="row mb-5">
        <StatCard title="Total Energy Saved" value={stats.totalEnergySaved} suffix="kWh" iconClass="bi bi-lightning-charge" colorClass="warning" />
        <StatCard title="CO₂ Emission Reduction" value={stats.totalCo2Reduced} suffix="kg" iconClass="bi bi-cloud-arrow-down" colorClass="success" />
        <StatCard title="Bandwidth Conserved" value={stats.totalBandwidthSaved} suffix="MB" iconClass="bi bi-hdd-network" colorClass="info" />
      </div>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <ChartWidget type="bar" data={impactChartData} title="Environmental Impact Breakdown" />
        </div>
        
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-subtle">
              <h6 className="mb-0 fw-bold">Recent Duplicate Preventions</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th className="px-4">Time</th>
                      <th>Dataset</th>
                      <th>Energy (kWh)</th>
                      <th>CO₂ (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">No energy logs recorded yet.</td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log.id}>
                          <td className="px-4 text-muted small">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="fw-semibold text-truncate" style={{ maxWidth: '150px' }}>
                            {log.datasets?.file_name || 'Unknown'}
                          </td>
                          <td className="text-success fw-bold">+{log.energy_saved_kwh.toFixed(4)}</td>
                          <td className="text-success fw-bold">+{log.co2_reduction.toFixed(4)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalytics;
