const express = require('express');
const router = express.Router();
const {
  addFavorite,
  getFavorites,
  removeFavorite,
  checkFavoriteStatus,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All favorite routes require authentication

router.get('/', getFavorites);
router.get('/check/:materialId', checkFavoriteStatus);
router.post('/:materialId', addFavorite);
router.delete('/:materialId', removeFavorite);

module.exports = router;
