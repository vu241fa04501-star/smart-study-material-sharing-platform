const Review = require('../models/Review');
const Material = require('../models/Material');

// Helper to recalculate average rating for a material
const updateMaterialRating = async (materialId) => {
  const reviews = await Review.find({ materialId });
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    await Material.findByIdAndUpdate(materialId, {
      averageRating: 0,
      totalReviews: 0,
    });
    return;
  }

  const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
  const averageRating = Number((sum / totalReviews).toFixed(1));

  await Material.findByIdAndUpdate(materialId, {
    averageRating,
    totalReviews,
  });
};

// @desc    Add a review for a study material
// @route   POST /api/reviews/:materialId
// @access  Private (Student/Admin)
const addReview = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const { rating, comment } = req.body;

    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5 stars',
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please write a review comment',
      });
    }

    // Check material existence
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
        message: 'Cannot review study materials that are not approved yet',
      });
    }

    // Check if user already reviewed this material
    const alreadyReviewed = await Review.findOne({
      userId: req.user._id,
      materialId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message:
          'You have already submitted a review for this study material. Duplicate reviews are not allowed.',
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user._id,
      materialId,
      rating: numRating,
      comment: comment.trim(),
    });

    // Recalculate material average rating
    await updateMaterialRating(materialId);

    const populatedReview = await Review.findById(review._id).populate(
      'userId',
      'name email'
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a material
// @route   GET /api/reviews/:materialId
// @access  Public
const getMaterialReviews = async (req, res, next) => {
  try {
    const { materialId } = req.params;

    const reviews = await Review.find({ materialId })
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getMaterialReviews,
};
