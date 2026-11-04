import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { HeartIcon, BookIcon } from '../components/Icons';
import { favoriteAPI } from '../services/api';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteAPI.getAll();
      if (res.data?.success) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Failed to load your favorite study materials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteRemoved = (removedId) => {
    setFavorites((prev) => prev.filter((m) => m._id !== removedId));
    setAlert({
      type: 'info',
      message: 'Material removed from your favorites list.',
    });
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your saved materials..." />;
  }

  return (
    <div className="favorites-page">
      <div className="page-container">
        <div className="page-header">
          <div className="header-icon-title">
            <HeartIcon size={28} filled className="text-rose" />
            <div>
              <h2>Saved Study Materials</h2>
              <p>Quick access to all notes and documents bookmarked for your exams</p>
            </div>
          </div>
        </div>

        {alert.message && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        {favorites.length > 0 ? (
          <div className="materials-grid">
            {favorites.map((material) => (
              <MaterialCard
                key={material._id}
                material={material}
                onFavoriteRemoved={handleFavoriteRemoved}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <HeartIcon size={48} className="empty-icon text-muted" />
            <h3>No Saved Materials Yet</h3>
            <p>
              When browsing notes, click the heart icon to save resources for easy
              reference during revision.
            </p>
            <Link to="/materials" className="btn-primary">
              Explore Study Materials
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
