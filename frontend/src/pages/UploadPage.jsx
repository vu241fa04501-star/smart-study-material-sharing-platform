import AlertMessage from "../components/AlertMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon, FilePdfIcon, ImageIcon, UploadIcon } from "../components/Icons";
import { materialAPI, subjectAPI } from "../services/api";

const UploadPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [filePreviewName, setFilePreviewName] = useState('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectAPI.getAll();
        if (res.data?.success) {
          setSubjects(res.data.data);
          if (res.data.data.length > 0) {
            setSubject(res.data.data[0]._id);
          }
        }
      } catch (err) {
        setAlert({
          type: 'error',
          message: 'Failed to load subject categories. Please reload the page.',
        });
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate size (10 MB = 10 * 1024 * 1024 bytes)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setAlert({
        type: 'error',
        message: 'File size exceeds 10 MB limit. Please choose a smaller file.',
      });
      setFile(null);
      setFilePreviewName('');
      return;
    }

    // Validate type (PDF or Image)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setAlert({
        type: 'error',
        message:
          'Unsupported file format. Please upload a PDF document or image (.jpg, .jpeg, .png, .webp).',
      });
      setFile(null);
      setFilePreviewName('');
      return;
    }

    setFile(selectedFile);
    setFilePreviewName(selectedFile.name);
    setFileSizeFormatted((selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB');
    setAlert({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return setAlert({ type: 'error', message: 'Please enter a title for the material.' });
    }
    if (!description.trim()) {
      return setAlert({ type: 'error', message: 'Please provide a descriptive overview.' });
    }
    if (!subject) {
      return setAlert({ type: 'error', message: 'Please select an academic subject.' });
    }
    if (!file) {
      return setAlert({ type: 'error', message: 'Please choose a PDF or image file to upload.' });
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('subject', subject);
    formData.append('file', file);

    try {
      setUploading(true);
      setAlert({ type: '', message: '' });

      const res = await materialAPI.upload(formData);

      if (res.data?.success) {
        setAlert({
          type: 'success',
          message:
            'Study material uploaded successfully! It is now pending admin approval before appearing publicly.',
        });

        // Reset form
        setTitle('');
        setDescription('');
        setFile(null);
        setFilePreviewName('');

        // Redirect to My Uploads page after 2 seconds
        setTimeout(() => {
          navigate('/my-uploads');
        }, 2200);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'Error uploading file. Please try again.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setUploading(false);
    }
  };

  if (loadingSubjects) {
    return <LoadingSpinner fullPage message="Loading upload form..." />;
  }

  return (
    <div className="upload-page">
      <div className="page-container form-container-narrow">
        <div className="page-header text-center">
          <h2>Upload Study Material</h2>
          <p>
            Share lecture notes, question banks, or diagrams with your classmates.
            All uploads are reviewed by platform admins before publication.
          </p>
        </div>

        {alert.message && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        <div className="upload-card">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="title">Material Title *</label>
              <input
                type="text"
                id="title"
                placeholder="e.g. Tree Traversal Algorithms & Binary Search Trees Explained"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={uploading}
                className="form-control"
              />
              <span className="field-hint">
                Provide a clear, descriptive title to help other students find your notes.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Academic Subject Category *</label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={uploading}
                className="form-control select-control"
              >
                {subjects.map((subj) => (
                  <option key={subj._id} value={subj._id}>
                    {subj.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Overview & Content Description *</label>
              <textarea
                id="description"
                rows="4"
                placeholder="Briefly describe what topics, formulas, or question types are covered in this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={uploading}
                className="form-control"
              />
            </div>

            {/* File Upload Box */}
            <div className="form-group">
              <label>Study Material File (PDF or Image, Max 10 MB) *</label>
              <div className="file-dropzone">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="file-input-hidden"
                />
                <label htmlFor="file-upload" className="file-dropzone-label">
                  <div className="dropzone-icon">
                    <UploadIcon size={32} />
                  </div>
                  <span className="dropzone-text">
                    <strong>Click to browse file</strong> or select from device
                  </span>
                  <span className="dropzone-sub">
                    Accepted formats: PDF documents, PNG, JPG, WEBP (Max 10 MB)
                  </span>
                </label>
              </div>

              {filePreviewName && (
                <div className="selected-file-pill">
                  {file?.type === 'application/pdf' ? (
                    <FilePdfIcon size={18} />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                  <div className="file-meta">
                    <span className="file-name">{filePreviewName}</span>
                    <span className="file-size">({fileSizeFormatted})</span>
                  </div>
                  <CheckIcon size={18} className="text-success" />
                </div>
              )}
            </div>

            <div className="upload-notice-box">
              <span className="notice-title">💡 Important Note for Students:</span>
              <p>
                To maintain high academic standards, uploaded study materials
                are verified by an administrator before appearing on the public
                Study Materials catalog. You can track the status of your
                submission on the <strong>My Uploads</strong> page.
              </p>
            </div>

            <button
              type="submit"
              className="btn-upload-submit"
              disabled={uploading}
            >
              {uploading ? (
                <span>Uploading & Processing File...</span>
              ) : (
                <>
                  <UploadIcon size={18} /> Submit Material for Verification
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
