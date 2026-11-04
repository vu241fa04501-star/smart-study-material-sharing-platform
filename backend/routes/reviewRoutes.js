const express = require('express');
const router = express.Router();
const {
  addReview,
  getMaterialReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:materialId', protect, addReview);
router.get('/:materialId', getMaterialReviews);

module.exports = router;
