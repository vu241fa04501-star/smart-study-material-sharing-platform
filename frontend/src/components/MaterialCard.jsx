import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { DownloadIcon, HeartIcon, FilePdfIcon, ImageIcon, UserIcon } from './Icons';
import { favoriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MaterialCard = ({ material, onFavoriteRemoved }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to save materials to your favorites.');
      return;
    }

    try {
      setSavingFav(true);
      if (isFavorite) {
        await favoriteAPI.remove(material._id);
        setIsFavorite(false);
        if (onFavoriteRemoved) onFavoriteRemoved(material._id);
      } else {
        await favoriteAPI.add(material._id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.warn('Favorite action failed:', err.message);
    } finally {
      setSavingFav(false);
    }
  };

  const subjectName = material.subject?.subjectName || 'General Engineering';
  const uploaderName = material.uploadedBy?.name || 'Fellow Student';
  const isPdf = material.fileType === 'pdf';

  return (
    <div className="study-card">
      <div className="study-card-header">
        <span className="badge-subject">{subjectName}</span>
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          disabled={savingFav}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <HeartIcon size={16} filled={isFavorite} />
        </button>
      </div>

      <div className="study-card-body">
        <div className="study-file-type">
          {isPdf ? (
            <span className="file-badge pdf">
              <FilePdfIcon size={14} /> PDF
            </span>
          ) : (
            <span className="file-badge img">
              <ImageIcon size={14} /> IMAGE
            </span>
          )}
        </div>

        <h3 className="study-card-title">
          <Link to={`/materials/${material._id}`}>{material.title}</Link>
        </h3>

        <p className="study-card-desc">
          {material.description?.length > 110
            ? `${material.description.substring(0, 110)}...`
            : material.description}
        </p>

        <div className="study-card-meta">
          <div className="uploader-info">
            <UserIcon size={14} />
            <span>{uploaderName}</span>
          </div>
          <div className="rating-info">
            <StarRating rating={material.averageRating || 0} size={15} showValue />
          </div>
        </div>
      </div>

      <div className="study-card-footer">
        <div className="download-stat">
          <DownloadIcon size={15} />
          <span>{material.downloadCount || 0} downloads</span>
        </div>
        <Link to={`/materials/${material._id}`} className="btn-view-details">
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
};

export default MaterialCard;
