const express = require('express');
const router = express.Router();
const {
  getPendingMaterials,
  approveMaterial,
  rejectMaterial,
  adminDeleteMaterial,
  getAllUsers,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/materials/pending', getPendingMaterials);
router.put('/materials/:id/approve', approveMaterial);
router.put('/materials/:id/reject', rejectMaterial);
router.delete('/materials/:id', adminDeleteMaterial);
router.get('/users', getAllUsers);
router.get('/stats', getAdminStats);

module.exports = router;
