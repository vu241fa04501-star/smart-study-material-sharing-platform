import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { materialAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  UploadIcon,
  TrashIcon,
  FilePdfIcon,
  ImageIcon,
  DownloadIcon,
  StarIcon,
} from '../components/Icons';

const MyUploadsPage = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const fetchMyUploads = async () => {
    try {
      setLoading(true);
      const res = await materialAPI.getMyUploads();
      if (res.data?.success) {
        setUploads(res.data.data);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Failed to retrieve your uploaded study materials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await materialAPI.delete(id);
      setUploads((prev) => prev.filter((item) => item._id !== id));
      setAlert({
        type: 'success',
        message: `"${title}" has been deleted successfully.`,
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete upload.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your uploads..." />;
  }

  return (
    <div className="my-uploads-page">
      <div className="page-container">
        <div className="page-header space-between">
          <div>
            <h2>My Uploaded Study Materials</h2>
            <p>Track moderation status and manage your academic contributions</p>
          </div>
          <Link to="/upload" className="btn-primary">
            <UploadIcon size={18} /> Upload New Notes
          </Link>
        </div>

        {alert.message && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        {uploads.length > 0 ? (
          <div className="table-responsive-wrapper">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>Study Material</th>
                  <th>Subject</th>
                  <th>Uploaded Date</th>
                  <th>Status</th>
                  <th>Downloads</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((mat) => {
                  const isPdf = mat.fileType === 'pdf';
                  return (
                    <tr key={mat._id}>
                      <td className="material-cell">
                        <div className="table-file-badge">
                          {isPdf ? <FilePdfIcon size={18} /> : <ImageIcon size={18} />}
                        </div>
                        <div className="table-mat-info">
                          <Link to={`/materials/${mat._id}`} className="mat-link">
                            {mat.title}
                          </Link>
                          <span className="file-subtext">
                            {mat.fileName} &bull; {(mat.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="badge-subject-table">
                          {mat.subject?.subjectName || 'Engineering'}
                        </span>
                      </td>

                      <td>
                        <span className="date-text">
                          {new Date(mat.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td>
                        <span className={`status-pill status-${mat.status}`}>
                          {mat.status.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div className="downloads-stat-cell">
                          <DownloadIcon size={14} />
                          <span>{mat.downloadCount || 0}</span>
                        </div>
                      </td>

                      <td>
                        <div className="rating-stat-cell">
                          <StarIcon size={14} filled={mat.averageRating > 0} />
                          <span>{Number(mat.averageRating || 0).toFixed(1)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="table-actions-cell">
                          <Link
                            to={`/materials/${mat._id}`}
                            className="btn-table-view"
                            title="View material page"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(mat._id, mat.title)}
                            className="btn-table-delete"
                            title="Delete this material"
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-card">
            <UploadIcon size={48} className="empty-icon text-muted" />
            <h3>No Notes Uploaded Yet</h3>
            <p>
              Share your semester handwritten notes or lab assignments with other
              students and start building your contributor profile!
            </p>
            <Link to="/upload" className="btn-primary">
              <UploadIcon size={18} /> Upload Your First Material
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUploadsPage;
