import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { materialAPI, reviewAPI, favoriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  DownloadIcon,
  HeartIcon,
  FilePdfIcon,
  ImageIcon,
  UserIcon,
  StarIcon,
  ShieldIcon,
  TrashIcon,
} from '../components/Icons';

const MaterialDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [material, setMaterial] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Review Form state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [matRes, revRes] = await Promise.all([
        materialAPI.getById(id),
        reviewAPI.getByMaterial(id),
      ]);

      if (matRes.data?.success) {
        setMaterial(matRes.data.data);
      }
      if (revRes.data?.success) {
        setReviews(revRes.data.data);
      }

      // Check favorite status if authenticated
      if (isAuthenticated) {
        try {
          const favRes = await favoriteAPI.checkStatus(id);
          if (favRes.data?.success) {
            setIsFavorite(favRes.data.isFavorite);
          }
        } catch (e) {
          // ignore favorite check failure
        }
      }
    } catch (err) {
      console.error('Error fetching material details:', err.message);
      setAlert({
        type: 'error',
        message:
          err.response?.data?.message || 'Study material not found or access restricted.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await materialAPI.download(id);

      // Increment local count
      if (material) {
        setMaterial({ ...material, downloadCount: (material.downloadCount || 0) + 1 });
      }

      // If backend returned downloadUrl (Cloudinary / direct)
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      } else {
        // Local file or direct stream
        window.open(material.fileUrl, '_blank');
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Could not download file. Please check permissions.',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      return setAlert({
        type: 'info',
        message: 'Please sign in to save materials to your favorites.',
      });
    }

    try {
      if (isFavorite) {
        await favoriteAPI.remove(id);
        setIsFavorite(false);
        setAlert({ type: 'success', message: 'Removed from your favorites.' });
      } else {
        await favoriteAPI.add(id);
        setIsFavorite(true);
        setAlert({ type: 'success', message: 'Added to your favorites list!' });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update favorites.',
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      return setAlert({
        type: 'info',
        message: 'Please log in to submit a rating and review.',
      });
    }

    if (!userComment.trim()) {
      return setAlert({
        type: 'error',
        message: 'Please write a review comment.',
      });
    }

    try {
      setSubmittingReview(true);
      setAlert({ type: '', message: '' });

      const res = await reviewAPI.addReview(id, {
        rating: userRating,
        comment: userComment.trim(),
      });

      if (res.data?.success) {
        setAlert({
          type: 'success',
          message: 'Review submitted successfully! Thank you for your feedback.',
        });
        setUserComment('');
        // Refresh details and reviews
        fetchDetails();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message:
          err.response?.data?.message || 'Failed to submit review. Duplicate reviews are not allowed.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!window.confirm('Are you sure you want to delete this study material?')) {
      return;
    }

    try {
      await materialAPI.delete(id);
      alert('Material deleted successfully.');
      navigate('/materials');
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete material.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading material details..." />;
  }

  if (!material) {
    return (
      <div className="page-container py-5 text-center">
        <h2>Material Not Found</h2>
        <p>The requested study material could not be located or is pending verification.</p>
        <Link to="/materials" className="btn-primary mt-3">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const isOwner = user && material.uploadedBy && user._id === material.uploadedBy._id;
  const canDelete = isOwner || isAdmin;
  const isPdf = material.fileType === 'pdf';
  const hasUserReviewed = reviews.some((r) => r.userId?._id === user?._id);

  return (
    <div className="material-details-page">
      <div className="page-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumbs">
          <Link to="/">Home</Link> &rsaquo;{' '}
          <Link to="/materials">Study Materials</Link> &rsaquo;{' '}
          <span>{material.title}</span>
        </div>

        {alert.message && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        {/* Material Status Banner if pending or rejected */}
        {material.status !== 'approved' && (
          <div className={`status-alert-banner ${material.status}`}>
            <ShieldIcon size={20} />
            <span>
              This material is currently <strong>{material.status.toUpperCase()}</strong>. It is
              visible only to you and platform administrators until approved.
            </span>
          </div>
        )}

        {/* Top Details Card */}
        <div className="material-main-card">
          <div className="details-header-row">
            <div>
              <span className="badge-subject">
                {material.subject?.subjectName || 'Engineering'}
              </span>
              <h1 className="material-detail-title">{material.title}</h1>
            </div>

            <div className="details-action-buttons">
              <button
                onClick={handleToggleFavorite}
                className={`btn-action-fav ${isFavorite ? 'active' : ''}`}
                title={isFavorite ? 'Saved in favorites' : 'Save to favorites'}
              >
                <HeartIcon size={18} filled={isFavorite} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              {canDelete && (
                <button
                  onClick={handleDeleteMaterial}
                  className="btn-action-delete"
                  title="Delete this study material"
                >
                  <TrashIcon size={18} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Meta Info Bar */}
          <div className="details-meta-bar">
            <div className="meta-item">
              <UserIcon size={16} />
              <span>Uploaded by: <strong>{material.uploadedBy?.name || 'Student'}</strong></span>
            </div>
            <div className="meta-item">
              <span>Date: <strong>{new Date(material.createdAt).toLocaleDateString()}</strong></span>
            </div>
            <div className="meta-item">
              <DownloadIcon size={16} />
              <span><strong>{material.downloadCount}</strong> Downloads</span>
            </div>
            <div className="meta-item rating">
              <StarRating rating={material.averageRating || 0} size={16} showValue />
              <span className="total-rev-count">({material.totalReviews} reviews)</span>
            </div>
          </div>

          {/* Description */}
          <div className="material-description-section">
            <h3>Overview & Key Topics</h3>
            <p className="description-text">{material.description}</p>
          </div>

          {/* File Download / View Section */}
          <div className="file-access-card">
            <div className="file-access-info">
              <div className="file-icon-large">
                {isPdf ? <FilePdfIcon size={32} /> : <ImageIcon size={32} />}
              </div>
              <div className="file-details-text">
                <h4>{material.fileName || 'Academic Note Document'}</h4>
                <p>
                  Format: <strong>{material.fileType?.toUpperCase()}</strong> &bull; Size:{' '}
                  <strong>
                    {material.fileSize
                      ? `${(material.fileSize / (1024 * 1024)).toFixed(2)} MB`
                      : 'Verified Document'}
                  </strong>
                </p>
              </div>
            </div>

            <div className="file-access-cta">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-download-primary"
              >
                <DownloadIcon size={20} />
                <span>{downloading ? 'Preparing File...' : 'Download Note'}</span>
              </button>

              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-view-preview"
              >
                Preview in Browser &nearr;
              </a>
            </div>
          </div>
        </div>

        {/* Ratings and Reviews Section */}
        <div className="reviews-section-container">
          <div className="reviews-header">
            <h3>Student Ratings & Peer Reviews</h3>
            <div className="average-rating-summary">
              <span className="big-rating-number">
                {Number(material.averageRating || 0).toFixed(1)}
              </span>
              <div>
                <StarRating rating={material.averageRating || 0} size={20} />
                <p>Based on {material.totalReviews} student reviews</p>
              </div>
            </div>
          </div>

          {/* Write a Review Box */}
          {isAuthenticated ? (
            !hasUserReviewed ? (
              <div className="add-review-card">
                <h4>Write a Review for Your Classmates</h4>
                <p>
                  How helpful were these notes for your revision or exam preparation?
                </p>

                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="rating-select-group">
                    <label>Select Your Rating:</label>
                    <StarRating
                      rating={userRating}
                      isInteractive
                      onRatingChange={(newVal) => setUserRating(newVal)}
                      size={26}
                    />
                    <span className="selected-rating-label">
                      {userRating} / 5 Stars
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="userComment">Your Review Comment:</label>
                    <textarea
                      id="userComment"
                      rows="3"
                      placeholder="Share your feedback: are explanations clear? Are all topics covered?..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      required
                      disabled={submittingReview}
                      className="form-control"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-submit-review"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="review-already-submitted-pill">
                <ShieldIcon size={16} />
                <span>You have already submitted a review for this study material. Thank you!</span>
              </div>
            )
          ) : (
            <div className="login-to-review-box">
              <p>Want to rate or review this material?</p>
              <Link to="/login" className="btn-secondary-sm">
                Log In to Leave a Review
              </Link>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            <h4>Student Reviews ({reviews.length})</h4>
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="review-item-card">
                  <div className="review-header-row">
                    <div className="reviewer-info">
                      <div className="avatar-circle">
                        {rev.userId?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <span className="reviewer-name">{rev.userId?.name || 'Student'}</span>
                        <span className="review-date">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <StarRating rating={rev.rating} size={15} />
                  </div>
                  <p className="review-comment-text">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="empty-reviews-state">
                <p>No student reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailsPage;
