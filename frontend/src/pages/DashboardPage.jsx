import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/MaterialCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookIcon,
  UploadIcon,
  HeartIcon,
  DownloadIcon,
  StarIcon,
  UserIcon,
} from '../components/Icons';
import { materialAPI, subjectAPI, favoriteAPI } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [popularMaterials, setPopularMaterials] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({
    totalAvailable: 0,
    myUploadsCount: 0,
    favoritesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          popularRes,
          recentRes,
          subjectsRes,
          myUploadsRes,
          favoritesRes,
          allMaterialsRes,
        ] = await Promise.all([
          materialAPI.getPopular(),
          materialAPI.getRecent(),
          subjectAPI.getAll(),
          materialAPI.getMyUploads(),
          favoriteAPI.getAll(),
          materialAPI.getAll({ limit: 1 }),
        ]);

        if (popularRes.data?.success) setPopularMaterials(popularRes.data.data);
        if (recentRes.data?.success) setRecentMaterials(recentRes.data.data);
        if (subjectsRes.data?.success) setSubjects(subjectsRes.data.data);

        setStats({
          totalAvailable: allMaterialsRes.data?.total || 0,
          myUploadsCount: myUploadsRes.data?.count || 0,
          favoritesCount: favoritesRes.data?.count || 0,
        });
      } catch (err) {
        console.error('Error loading student dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading student dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="page-container">
        {/* Welcome Header */}
        <div className="dashboard-welcome-banner">
          <div className="welcome-text">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>
              Your academic cockpit: discover approved study resources, manage your uploads,
              and stay on top of your semester exam preparations.
            </p>
          </div>
          <div className="welcome-action">
            <Link to="/upload" className="btn-dashboard-upload">
              <UploadIcon size={18} /> Upload New Material
            </Link>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon-wrap bg-blue">
              <BookIcon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalAvailable}</h3>
              <p>Total Available Notes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap bg-purple">
              <UploadIcon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.myUploadsCount}</h3>
              <p>My Uploaded Notes</p>
            </div>
            <Link to="/my-uploads" className="stat-link">
              View &rarr;
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap bg-rose">
              <HeartIcon size={24} filled />
            </div>
            <div className="stat-info">
              <h3>{stats.favoritesCount}</h3>
              <p>Saved to Favorites</p>
            </div>
            <Link to="/favorites" className="stat-link">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="quick-actions-bar">
          <Link to="/materials" className="quick-action-item">
            <BookIcon size={20} />
            <span>Browse All Materials</span>
          </Link>
          <Link to="/upload" className="quick-action-item">
            <UploadIcon size={20} />
            <span>Upload Handwritten Notes</span>
          </Link>
          <Link to="/favorites" className="quick-action-item">
            <HeartIcon size={20} />
            <span>View Saved Favorites</span>
          </Link>
          <Link to="/my-uploads" className="quick-action-item">
            <UserIcon size={20} />
            <span>Track My Upload Status</span>
          </Link>
        </div>

        {/* Subject Categories Quick Section */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Subject Categories</h3>
            <Link to="/materials" className="link-subtle">
              View All Subjects &rarr;
            </Link>
          </div>
          <div className="subject-tags-list">
            {subjects.map((sub) => (
              <Link
                key={sub._id}
                to={`/materials?subject=${sub._id}`}
                className="subject-tag-chip"
              >
                <span>{sub.subjectName}</span>
                {sub.materialCount !== undefined && (
                  <span className="chip-badge">{sub.materialCount}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Uploads Section */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Recent Study Material Uploads</h3>
            <Link to="/materials?sort=recent" className="link-subtle">
              Browse More &rarr;
            </Link>
          </div>
          {recentMaterials.length > 0 ? (
            <div className="materials-grid">
              {recentMaterials.slice(0, 3).map((material) => (
                <MaterialCard key={material._id} material={material} />
              ))}
            </div>
          ) : (
            <div className="empty-state-card small">
              <p>No recent materials found.</p>
            </div>
          )}
        </div>

        {/* Popular Materials Section */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Top Rated & Most Downloaded Resources</h3>
            <Link to="/materials?sort=popular" className="link-subtle">
              See All &rarr;
            </Link>
          </div>
          {popularMaterials.length > 0 ? (
            <div className="materials-grid">
              {popularMaterials.slice(0, 3).map((material) => (
                <MaterialCard key={material._id} material={material} />
              ))}
            </div>
          ) : (
            <div className="empty-state-card small">
              <p>No popular materials available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
