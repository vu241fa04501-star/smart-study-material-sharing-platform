import React, { useState, useEffect } from 'react';
import { adminAPI, subjectAPI } from '../services/api';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  BookIcon,
  UserIcon,
  FilePdfIcon,
  ImageIcon,
  DownloadIcon,
} from '../components/Icons';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'subjects' | 'users'
  const [stats, setStats] = useState(null);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Add Subject Form State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchInitialAdminData();
  }, []);

  const fetchInitialAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, subjectsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPending(),
        subjectAPI.getAll(),
        adminAPI.getUsers(),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (pendingRes.data?.success) setPendingMaterials(pendingRes.data.data);
      if (subjectsRes.data?.success) setSubjects(subjectsRes.data.data);
      if (usersRes.data?.success) setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err.message);
      setAlert({
        type: 'error',
        message: 'Failed to load administrator dashboard data. Verify admin role.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, title) => {
    try {
      const res = await adminAPI.approve(id);
      if (res.data?.success) {
        setPendingMaterials((prev) => prev.filter((m) => m._id !== id));
        setStats((prev) => prev ? {
          ...prev,
          totalPending: Math.max(0, prev.totalPending - 1),
          totalApproved: prev.totalApproved + 1,
        } : null);
        setAlert({
          type: 'success',
          message: `Material "${title}" approved and published to the public catalog!`,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Error approving material.',
      });
    }
  };

  const handleReject = async (id, title) => {
    try {
      const res = await adminAPI.reject(id);
      if (res.data?.success) {
        setPendingMaterials((prev) => prev.filter((m) => m._id !== id));
        setStats((prev) => prev ? {
          ...prev,
          totalPending: Math.max(0, prev.totalPending - 1),
          totalRejected: prev.totalRejected + 1,
        } : null);
        setAlert({
          type: 'warning',
          message: `Material "${title}" was rejected.`,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Error rejecting material.',
      });
    }
  };

  const handleDeleteMaterial = async (id, title) => {
    if (!window.confirm(`Permanently remove and delete material "${title}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteMaterial(id);
      setPendingMaterials((prev) => prev.filter((m) => m._id !== id));
      setStats((prev) => prev ? {
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1),
      } : null);
      setAlert({
        type: 'success',
        message: `Material "${title}" was permanently deleted.`,
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Error deleting material.',
      });
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      return setAlert({ type: 'error', message: 'Subject name cannot be empty.' });
    }

    try {
      setCreatingSubject(true);
      const res = await subjectAPI.create({
        subjectName: newSubjectName.trim(),
        description: newSubjectDesc.trim(),
      });

      if (res.data?.success) {
        setSubjects((prev) => [...prev, res.data.data]);
        setNewSubjectName('');
        setNewSubjectDesc('');
        setStats((prev) => prev ? { ...prev, totalSubjects: prev.totalSubjects + 1 } : null);
        setAlert({
          type: 'success',
          message: `Subject "${res.data.data.subjectName}" added successfully!`,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create subject.',
      });
    } finally {
      setCreatingSubject(false);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete subject "${name}"?`)) {
      return;
    }

    try {
      const res = await subjectAPI.delete(id);
      if (res.data?.success) {
        setSubjects((prev) => prev.filter((s) => s._id !== id));
        setStats((prev) => prev ? { ...prev, totalSubjects: Math.max(0, prev.totalSubjects - 1) } : null);
        setAlert({
          type: 'success',
          message: `Subject "${name}" deleted.`,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete subject.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading administrator dashboard..." />;
  }

  return (
    <div className="admin-page">
      <div className="page-container">
        {/* Header */}
        <div className="admin-header-row">
          <div className="admin-title-wrap">
            <div className="admin-badge-icon">
              <ShieldIcon size={26} />
            </div>
            <div>
              <h2>Administrator Control Center</h2>
              <p>Moderate student uploads, approve study resources, and manage curriculum subjects</p>
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

        {/* Stats Row */}
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card border-amber">
              <span className="stat-label">Pending Approval</span>
              <h3 className="stat-value text-amber">{stats.totalPending}</h3>
              <span className="stat-sub">Awaiting moderation</span>
            </div>

            <div className="admin-stat-card border-emerald">
              <span className="stat-label">Approved Materials</span>
              <h3 className="stat-value text-emerald">{stats.totalApproved}</h3>
              <span className="stat-sub">Publicly available</span>
            </div>

            <div className="admin-stat-card border-blue">
              <span className="stat-label">Registered Students</span>
              <h3 className="stat-value text-blue">{stats.totalStudents}</h3>
              <span className="stat-sub">Total active users: {stats.totalUsers}</span>
            </div>

            <div className="admin-stat-card border-indigo">
              <span className="stat-label">Total Downloads</span>
              <h3 className="stat-value text-indigo">{stats.totalDownloads}</h3>
              <span className="stat-sub">Community engagement</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button
            className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Uploads Moderation ({pendingMaterials.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Manage Subjects ({subjects.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Registered Users ({users.length})
          </button>
        </div>

        {/* TAB 1: PENDING UPLOADS */}
        {activeTab === 'pending' && (
          <div className="admin-tab-content">
            <div className="content-intro-box">
              <h3>Pending Verification Queue</h3>
              <p>
                Review submissions uploaded by students. Ensure notes are readable,
                academic, and appropriate before approving for general student access.
              </p>
            </div>

            {pendingMaterials.length > 0 ? (
              <div className="pending-cards-list">
                {pendingMaterials.map((item) => {
                  const isPdf = item.fileType === 'pdf';
                  return (
                    <div key={item._id} className="pending-item-card">
                      <div className="pending-item-header">
                        <div className="pending-file-icon">
                          {isPdf ? <FilePdfIcon size={24} /> : <ImageIcon size={24} />}
                        </div>
                        <div className="pending-title-group">
                          <h4>{item.title}</h4>
                          <div className="pending-meta-tags">
                            <span className="badge-subject">
                              {item.subject?.subjectName || 'General'}
                            </span>
                            <span className="uploader-tag">
                              By: <strong>{item.uploadedBy?.name || 'Student'}</strong> (
                              {item.uploadedBy?.email})
                            </span>
                            <span className="date-tag">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="pending-desc">{item.description}</p>

                      <div className="pending-file-preview-strip">
                        <span className="file-info-text">
                          File: <strong>{item.fileName}</strong> &bull; Size:{' '}
                          {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-preview-link"
                        >
                          Open Document to Verify &nearr;
                        </a>
                      </div>

                      <div className="pending-action-bar">
                        <button
                          onClick={() => handleApprove(item._id, item.title)}
                          className="btn-admin-approve"
                        >
                          <CheckIcon size={16} /> Approve & Publish
                        </button>
                        <button
                          onClick={() => handleReject(item._id, item.title)}
                          className="btn-admin-reject"
                        >
                          <XIcon size={16} /> Reject
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(item._id, item.title)}
                          className="btn-admin-delete"
                        >
                          <TrashIcon size={16} /> Delete Permanently
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state-card">
                <CheckIcon size={48} className="empty-icon text-emerald" />
                <h3>No Pending Submissions</h3>
                <p>All student uploads have been moderated and reviewed!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE SUBJECTS */}
        {activeTab === 'subjects' && (
          <div className="admin-tab-content">
            <div className="subjects-management-layout">
              {/* Add New Subject Form */}
              <div className="add-subject-card">
                <h3>Add New Academic Subject</h3>
                <form onSubmit={handleCreateSubject}>
                  <div className="form-group">
                    <label>Subject Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Cloud Computing & DevOps"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      required
                      disabled={creatingSubject}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Curriculum Description</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. Virtualization, AWS, Docker, Kubernetes, CI/CD pipelines..."
                      value={newSubjectDesc}
                      onChange={(e) => setNewSubjectDesc(e.target.value)}
                      disabled={creatingSubject}
                      className="form-control"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={creatingSubject}
                  >
                    {creatingSubject ? 'Adding Subject...' : 'Create Subject Category'}
                  </button>
                </form>
              </div>

              {/* Subject List */}
              <div className="subject-items-list">
                <h3>Current Active Subjects ({subjects.length})</h3>
                <div className="subjects-table-wrapper">
                  <table className="custom-data-table">
                    <thead>
                      <tr>
                        <th>Subject Name</th>
                        <th>Description</th>
                        <th>Materials</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s._id}>
                          <td><strong>{s.subjectName}</strong></td>
                          <td className="desc-cell">{s.description || '—'}</td>
                          <td>
                            <span className="count-pill">
                              {s.materialCount !== undefined ? s.materialCount : '—'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteSubject(s._id, s.subjectName)}
                              className="btn-table-delete"
                              title="Delete Subject"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED USERS */}
        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <div className="content-intro-box">
              <h3>Registered Students & Admins</h3>
              <p>Overview of all user accounts on the platform</p>
            </div>

            <div className="table-responsive-wrapper">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Date Registered</th>
                    <th>Total Uploads</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-table-cell">
                          <div className="avatar-circle-sm">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-pill role-${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className="uploads-count-badge">
                          {u.uploadsCount || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
