import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SearchIcon, BookIcon, UploadIcon, StarIcon, ShieldIcon } from '../components/Icons';
import { materialAPI, subjectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [popularMaterials, setPopularMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsRes, subjectsRes] = await Promise.all([
          materialAPI.getPopular(),
          subjectAPI.getAll(),
        ]);

        if (materialsRes.data && materialsRes.data.success) {
          setPopularMaterials(materialsRes.data.data);
        }
        if (subjectsRes.data && subjectsRes.data.success) {
          setSubjects(subjectsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/materials');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-tag">Academic Knowledge Sharing Hub</div>
          <h1 className="hero-title">
            Smart Study Material <span className="highlight-text">Sharing Platform</span>
          </h1>
          <p className="hero-subtitle">
            Say goodbye to scattered notes and lost PDFs. A centralized platform
            for engineering students to upload, organize, discover, and download
            high-quality study materials, verified lecture notes, and question banks.
          </p>

          {/* Search Bar Form */}
          <form className="hero-search-box" onSubmit={handleSearchSubmit}>
            <SearchIcon size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by note title, topic, or keyword (e.g. DSA, DBMS, OS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn-search-hero">
              Search Notes
            </button>
          </form>

          {/* Quick CTA Actions */}
          <div className="hero-cta-buttons">
            <Link to="/materials" className="btn-primary-large">
              Explore All Materials
            </Link>
            {isAuthenticated ? (
              <Link to="/upload" className="btn-outline-large">
                <UploadIcon size={18} /> Upload Study Notes
              </Link>
            ) : (
              <Link to="/register" className="btn-outline-large">
                Create Free Student Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon bg-blue">
                <BookIcon size={24} />
              </div>
              <h3>Centralized Notes</h3>
              <p>
                All your B.Tech CSE subjects organized in one place. No more
                rummaging through multiple messaging apps or drives.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-amber">
                <StarIcon size={24} filled />
              </div>
              <h3>Peer-Reviewed Quality</h3>
              <p>
                Discover the most helpful materials based on 1 to 5 star ratings
                and transparent student download counts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-emerald">
                <ShieldIcon size={24} />
              </div>
              <h3>Admin Verified</h3>
              <p>
                Every upload undergoes moderation to ensure accuracy,
                completeness, and adherence to academic standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Categories Section */}
      <section className="subjects-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Academic Subject Categories</h2>
              <p className="section-subtitle">
                Browse course materials tailored for Computer Science and Engineering
              </p>
            </div>
            <Link to="/materials" className="link-view-all">
              View All Categories &rarr;
            </Link>
          </div>

          <div className="subjects-grid">
            {subjects.slice(0, 8).map((subject) => (
              <div
                key={subject._id}
                className="subject-card"
                onClick={() => navigate(`/materials?subject=${subject._id}`)}
              >
                <div className="subject-icon-box">
                  <BookIcon size={20} />
                </div>
                <div className="subject-info">
                  <h4>{subject.subjectName}</h4>
                  <span className="material-count-tag">
                    {subject.materialCount !== undefined
                      ? `${subject.materialCount} available note${subject.materialCount === 1 ? '' : 's'}`
                      : 'Browse materials'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Study Materials Section */}
      <section className="popular-materials-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Study Materials</h2>
              <p className="section-subtitle">
                Most downloaded and top-rated lecture notes shared by top students
              </p>
            </div>
            <Link to="/materials?sort=popular" className="link-view-all">
              View All Popular &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading popular materials..." />
          ) : popularMaterials.length > 0 ? (
            <div className="materials-grid">
              {popularMaterials.map((material) => (
                <MaterialCard key={material._id} material={material} />
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <BookIcon size={40} className="empty-icon" />
              <h3>No Study Materials Published Yet</h3>
              <p>Be the first student to contribute notes to your classmates!</p>
              <Link to="/upload" className="btn-primary">
                Upload First Material
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="cta-banner-section">
        <div className="section-container">
          <div className="cta-box">
            <h2>Ready to Elevate Your Exam Preparation?</h2>
            <p>
              Join your fellow CSE students today. Share notes, download revision
              materials, and build an exceptional academic journey together.
            </p>
            <div className="cta-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-cta-primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn-cta-secondary">
                    Log In
                  </Link>
                </>
              ) : (
                <Link to="/upload" className="btn-cta-primary">
                  Share Your Notes Today
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
