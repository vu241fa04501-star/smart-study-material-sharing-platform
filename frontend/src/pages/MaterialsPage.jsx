import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SearchIcon, BookIcon } from '../components/Icons';
import { materialAPI, subjectAPI } from '../services/api';

const MaterialsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states initialized from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectAPI.getAll();
        if (res.data?.success) {
          setSubjects(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err.message);
      }
    };

    fetchSubjects();
  }, []);

  // Sync URL search params with state
  useEffect(() => {
    const querySearch = searchParams.get('search') || '';
    const querySubject = searchParams.get('subject') || 'all';
    const querySort = searchParams.get('sort') || 'recent';

    setSearchTerm(querySearch);
    setSelectedSubject(querySubject);
    setSortBy(querySort);

    fetchMaterials(querySearch, querySubject, querySort);
  }, [searchParams]);

  const fetchMaterials = async (search, subject, sort) => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (subject && subject !== 'all') params.subject = subject;
      if (sort) params.sort = sort;

      const res = await materialAPI.getAll(params);
      if (res.data?.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching materials:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams({ search: searchTerm });
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    updateQueryParams({ subject: subjectId });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    updateQueryParams({ sort: newSort });
  };

  const updateQueryParams = (updated) => {
    const nextParams = new URLSearchParams(searchParams);

    const merged = {
      search: searchTerm,
      subject: selectedSubject,
      sort: sortBy,
      ...updated,
    };

    if (merged.search) nextParams.set('search', merged.search);
    else nextParams.delete('search');

    if (merged.subject && merged.subject !== 'all') nextParams.set('subject', merged.subject);
    else nextParams.delete('subject');

    if (merged.sort && merged.sort !== 'recent') nextParams.set('sort', merged.sort);
    else nextParams.delete('sort');

    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSortBy('recent');
    setSearchParams({});
  };

  return (
    <div className="materials-page">
      <div className="page-container">
        {/* Page Header */}
        <div className="materials-header-banner">
          <h2>Academic Study Materials Catalog</h2>
          <p>
            Browse verified peer-uploaded lecture notes, formula cheat-sheets,
            and previous examination question solutions.
          </p>
        </div>

        {/* Filter and Search Controls Bar */}
        <div className="catalog-controls-card">
          <form onSubmit={handleSearchSubmit} className="search-filter-form">
            <div className="search-input-wrapper">
              <SearchIcon size={18} className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search notes by title or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search-input"
              />
            </div>
            <button type="submit" className="btn-filter-search">
              Search
            </button>
          </form>

          <div className="sorting-and-reset">
            <div className="select-wrapper">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={handleSortChange}
                className="filter-select"
              >
                <option value="recent">Newest Uploads</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="popular">Popular (Rating & Downloads)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {(searchTerm || selectedSubject !== 'all' || sortBy !== 'recent') && (
              <button onClick={clearAllFilters} className="btn-reset-filters">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="subject-filter-tabs">
          <button
            className={`subject-pill ${selectedSubject === 'all' ? 'active' : ''}`}
            onClick={() => handleSubjectChange('all')}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub._id}
              className={`subject-pill ${selectedSubject === sub._id ? 'active' : ''}`}
              onClick={() => handleSubjectChange(sub._id)}
            >
              {sub.subjectName}
            </button>
          ))}
        </div>

        {/* Results Count & Grid */}
        <div className="catalog-results-header">
          <p>
            Showing <strong>{materials.length}</strong> approved study materials
            {selectedSubject !== 'all' && (
              <span>
                {' '}
                for{' '}
                <strong>
                  {subjects.find((s) => s._id === selectedSubject)?.subjectName || 'Selected Subject'}
                </strong>
              </span>
            )}
            {searchTerm && (
              <span>
                {' '}
                matching "<strong>{searchTerm}</strong>"
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading study materials..." />
        ) : materials.length > 0 ? (
          <div className="materials-grid">
            {materials.map((material) => (
              <MaterialCard key={material._id} material={material} />
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <BookIcon size={48} className="empty-icon" />
            <h3>No Materials Found</h3>
            <p>
              We couldn't find any approved study notes matching your current search or filter criteria.
            </p>
            <button onClick={clearAllFilters} className="btn-primary">
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
