const Material = require('../models/Material');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const path = require('path');
const fs = require('fs');
const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');

// @desc    Get all pending study materials for admin moderation
// @route   GET /api/admin/materials/pending
// @access  Private/Admin
const getPendingMaterials = async (req, res, next) => {
  try {
    const pending = await Material.find({ status: 'pending' })
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pending.length,
      data: pending,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a study material
// @route   PUT /api/admin/materials/:id/approve
// @access  Private/Admin
const approveMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    material.status = 'approved';
    await material.save();

    const updated = await Material.findById(material._id)
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Material "${material.title}" has been approved successfully!`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a study material
// @route   PUT /api/admin/materials/:id/reject
// @access  Private/Admin
const rejectMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    material.status = 'rejected';
    await material.save();

    const updated = await Material.findById(material._id)
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Material "${material.title}" has been rejected.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete inappropriate study material
// @route   DELETE /api/admin/materials/:id
// @access  Private/Admin
const adminDeleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    // Clean up local or Cloudinary file
    if (material.fileUrl.includes('/uploads/')) {
      const filename = path.basename(material.fileUrl);
      const localPath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (e) {
          console.error('[Error deleting local file]:', e.message);
        }
      }
    } else if (
      isCloudinaryConfigured() &&
      material.filePublicId &&
      material.filePublicId !== ''
    ) {
      try {
        await cloudinary.uploader.destroy(material.filePublicId, {
          resource_type: material.fileType === 'pdf' ? 'raw' : 'image',
        });
      } catch (cErr) {
        console.error('[Error deleting Cloudinary file]:', cErr.message);
      }
    }

    await Review.deleteMany({ materialId: material._id });
    await Favorite.deleteMany({ materialId: material._id });
    await material.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Inappropriate material removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users for admin dashboard
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const uploadsCount = await Material.countDocuments({ uploadedBy: u._id });
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          uploadsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin statistics overview
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalPending,
      totalApproved,
      totalRejected,
      totalSubjects,
      totalReviews,
      downloadAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Material.countDocuments({ status: 'pending' }),
      Material.countDocuments({ status: 'approved' }),
      Material.countDocuments({ status: 'rejected' }),
      Subject.countDocuments(),
      Review.countDocuments(),
      Material.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } },
      ]),
    ]);

    const totalDownloads =
      downloadAgg.length > 0 && downloadAgg[0].totalDownloads
        ? downloadAgg[0].totalDownloads
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalPending,
        totalApproved,
        totalRejected,
        totalSubjects,
        totalReviews,
        totalDownloads,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingMaterials,
  approveMaterial,
  rejectMaterial,
  adminDeleteMaterial,
  getAllUsers,
  getAdminStats,
};
