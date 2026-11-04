const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getSubjects);
router.post('/', protect, authorize('admin'), createSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

module.exports = router;
