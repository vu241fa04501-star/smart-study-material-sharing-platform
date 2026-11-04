import React from 'react';
import { Link } from 'react-router-dom';
import { BookIcon } from './Icons';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <BookIcon size={22} />
            <span>SmartStudy Platform</span>
          </div>
          <p className="footer-desc">
            A centralized academic repository enabling students to discover,
            share, view, and review verified study materials, lecture notes, and
            question banks.
          </p>
          <p className="footer-credits">
            B.Tech CSE Full Stack Development Project &bull; MERN Stack Architecture
          </p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/materials">All Study Materials</Link></li>
            <li><Link to="/upload">Upload Study Material</Link></li>
            <li><Link to="/dashboard">Student Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Features</h4>
          <ul className="footer-links">
            <li><span>Subject-wise Categorization</span></li>
            <li><span>5-Star Peer Ratings & Reviews</span></li>
            <li><span>PDF & Image Preview</span></li>
            <li><span>Admin Verification & Moderation</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Technology Stack</h4>
          <ul className="tech-tags">
            <li>React.js</li>
            <li>Node.js</li>
            <li>Express.js</li>
            <li>MongoDB Atlas</li>
            <li>JWT Auth</li>
            <li>Cloudinary / Multer</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} Smart Study Material Sharing Platform. All rights reserved.</p>
          <p className="academic-badge">Academic Project &bull; B.Tech Computer Science & Engineering</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
