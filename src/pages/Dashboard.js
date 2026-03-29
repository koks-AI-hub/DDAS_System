import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ChartWidget from '../components/ChartWidget';
import { getDashboardStats } from '../services/dbService';
import { getCurrentUser } from '../services/authService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        const data = await getDashboardStats(user?.profile?.institution_id);
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
  }

  if (!stats) return <div className="alert alert-danger">Failed to load statistics</div>;

  // Mock data for charts as we don't have historical aggregation APIs out of the box
  // In a real app, this would be grouped by date from the DB.
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Energy Saved (kWh)',
        data: [0, 0, 0, stats.totalEnergySaved * 0.4, stats.totalEnergySaved * 0.6, stats.totalEnergySaved],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: ['Downloads', 'Duplicates Prevented'],
    datasets: [
      {
        label: 'Requests',
        data: [stats.totalDownloads, stats.duplicatePrevented],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Dashboard Overview</h2>
          <p className="text-muted mb-0">Track energy savings and dataset usage across your repository.</p>
        </div>
        {/* Only admins see the Add New User shortcut here */}
        {currentUser?.profile?.role === 'admin' && (
          <Link to="/users" className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2">
            <i className="bi bi-person-plus-fill"></i> Add New User
          </Link>
        )}
      </div>
      
      <div className="row">
        <StatCard title="Total Datasets" value={stats.totalDatasets} iconClass="bi bi-database" colorClass="primary" />
        <StatCard title="Total Downloads" value={stats.totalDownloads} iconClass="bi bi-download" colorClass="info" />
        <StatCard title="Duplicates Prevented" value={stats.duplicatePrevented} iconClass="bi bi-shield-check" colorClass="success" />
        
        <StatCard title="Energy Saved" value={stats.totalEnergySaved} suffix="kWh" iconClass="bi bi-lightning-charge" colorClass="warning" />
        <StatCard title="CO₂ Reduction" value={stats.totalCo2Reduced} suffix="kg" iconClass="bi bi-tree" colorClass="success" />
        <StatCard title="Bandwidth Saved" value={stats.totalBandwidthSaved} suffix="MB" iconClass="bi bi-hdd-network" colorClass="primary" />
      </div>

      <div className="row mt-4">
        <div className="col-md-8">
          <ChartWidget type="line" data={chartData} title="Energy Savings Over Time" />
        </div>
        <div className="col-md-4">
          <ChartWidget type="bar" data={barChartData} title="Request Overview" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
