const Favorite = require('../models/Favorite');
const Material = require('../models/Material');

// @desc    Add material to favorites
// @route   POST /api/favorites/:materialId
// @access  Private (Student/Admin)
const addFavorite = async (req, res, next) => {
  try {
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    if (material.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot save study materials that are not approved',
      });
    }

    const existingFavorite = await Favorite.findOne({
      userId: req.user._id,
      materialId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Material is already in your favorites',
      });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      materialId,
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all favorite materials for logged-in user
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: 'materialId',
        populate: [
          { path: 'subject', select: 'subjectName' },
          { path: 'uploadedBy', select: 'name email' },
        ],
      })
      .sort({ createdAt: -1 });

    // Filter out any favorites where the material might have been deleted or unapproved
    const validFavorites = favorites
      .filter((fav) => fav.materialId && fav.materialId.status === 'approved')
      .map((fav) => fav.materialId);

    res.status(200).json({
      success: true,
      count: validFavorites.length,
      data: validFavorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove material from favorites
// @route   DELETE /api/favorites/:materialId
// @access  Private
const removeFavorite = async (req, res, next) => {
  try {
    const { materialId } = req.params;

    const favorite = await Favorite.findOne({
      userId: req.user._id,
      materialId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Material not found in your favorites',
      });
    }

    await favorite.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a material is favorited by logged in user
// @route   GET /api/favorites/check/:materialId
// @access  Private
const checkFavoriteStatus = async (req, res, next) => {
  try {
    const { materialId } = req.params;

    const isFav = await Favorite.exists({
      userId: req.user._id,
      materialId,
    });

    res.status(200).json({
      success: true,
      isFavorite: !!isFav,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
  checkFavoriteStatus,
};
