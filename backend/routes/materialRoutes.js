const express = require('express');
const router = express.Router();
const {
  uploadMaterial,
  getMaterials,
  searchMaterials,
  getMaterialById,
  getMyUploads,
  downloadMaterial,
  deleteMaterial,
  getPopularMaterials,
  getRecentMaterials,
} = require('../controllers/materialController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Specific endpoints first to avoid parameterized route conflict
router.post('/upload', protect, upload.single('file'), uploadMaterial);
router.get('/', getMaterials);
router.get('/popular', getPopularMaterials);
router.get('/recent', getRecentMaterials);
router.get('/search', searchMaterials);
router.get('/my-uploads', protect, getMyUploads);

// Parameterized endpoints
router.get('/:id', optionalAuth, getMaterialById);
router.get('/:id/download', downloadMaterial);
router.delete('/:id', protect, deleteMaterial);

module.exports = router;
