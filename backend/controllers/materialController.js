const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const Subject = require('../models/Subject');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const {
  isCloudinaryConfigured,
  uploadToCloudinary,
  cloudinary,
} = require('../config/cloudinary');

// @desc    Upload new study material (Pending approval)
// @route   POST /api/materials/upload
// @access  Private (Student/Admin)
const uploadMaterial = async (req, res, next) => {
  try {
    const { title, description, subject } = req.body;

    if (!title || !description || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and subject',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a study material file (PDF or Image) to upload',
      });
    }

    // Verify subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected subject does not exist',
      });
    }

    const isPdf = req.file.mimetype === 'application/pdf';
    const fileType = isPdf ? 'pdf' : 'image';
    let fileUrl = '';
    let filePublicId = '';

    // Check if Cloudinary is configured (Production) or Local Upload (Development)
    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        fileUrl = cloudResult.url;
        filePublicId = cloudResult.public_id;
      } catch (cloudErr) {
        console.error('[Cloudinary Upload Error]:', cloudErr.message);
        return res.status(500).json({
          success: false,
          message: 'Error uploading file to Cloudinary cloud storage',
        });
      }
    } else {
      // Local file fallback
      const uploadDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname);
      const safeBase = path
        .basename(req.file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${Date.now()}_${safeBase}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, req.file.buffer);

      // Construct server URL
      const host = req.get('host');
      const protocol = req.protocol;
      fileUrl = `${protocol}://${host}/uploads/${filename}`;
      filePublicId = filename;
    }

    // Create material document
    const material = await Material.create({
      title: title.trim(),
      description: description.trim(),
      subject,
      uploadedBy: req.user._id,
      fileUrl,
      fileName: req.file.originalname,
      fileType,
      filePublicId,
      fileSize: req.file.size,
      status: 'pending', // Requires admin approval before public access
    });

    const populatedMaterial = await Material.findById(material._id)
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message:
        'Material uploaded successfully! It is now pending admin approval before appearing publicly.',
      data: populatedMaterial,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved study materials (with search, filter, and sorting)
// @route   GET /api/materials
// @access  Public
const getMaterials = async (req, res, next) => {
  try {
    const { search, subject, sort, limit = 50, page = 1 } = req.query;

    const query = { status: 'approved' };

    // Search filter: title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Subject filter
    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    // Sorting logic
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'rating') {
      sortOption = { averageRating: -1, totalReviews: -1 };
    } else if (sort === 'downloads') {
      sortOption = { downloadCount: -1 };
    } else if (sort === 'popular') {
      sortOption = { downloadCount: -1, averageRating: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageSize = parseInt(limit, 10);
    const currentPage = parseInt(page, 10);
    const skip = (currentPage - 1) * pageSize;

    const total = await Material.countDocuments(query);
    const materials = await Material.find(query)
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: materials.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize),
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search study materials
// @route   GET /api/materials/search
// @access  Public
const searchMaterials = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const materials = await Material.find({
      status: 'approved',
      $or: [
        { title: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
      ],
    })
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name')
      .sort({ averageRating: -1, downloadCount: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material details
// @route   GET /api/materials/:id
// @access  Public (Approved materials) or Owner/Admin
const getMaterialById = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('subject', 'subjectName description')
      .populate('uploadedBy', 'name email role');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    // If not approved, only uploader or admin can view
    if (material.status !== 'approved') {
      // Check auth if provided
      if (
        !req.user ||
        (req.user.role !== 'admin' &&
          req.user._id.toString() !== material.uploadedBy._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'This material is pending approval and cannot be accessed publicly.',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's uploaded materials
// @route   GET /api/materials/my-uploads
// @access  Private
const getMyUploads = async (req, res, next) => {
  try {
    const materials = await Material.find({ uploadedBy: req.user._id })
      .populate('subject', 'subjectName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download material (increments download count)
// @route   GET /api/materials/:id/download
// @access  Public
const downloadMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    if (material.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Only approved study materials can be downloaded.',
      });
    }

    // Increment download counter
    material.downloadCount += 1;
    await material.save();

    // If local file, serve directly with attachment disposition
    if (material.fileUrl.includes('/uploads/')) {
      const filename = path.basename(material.fileUrl);
      const filePath = path.join(__dirname, '..', 'uploads', filename);

      if (fs.existsSync(filePath)) {
        return res.download(filePath, material.fileName || filename);
      }
    }

    // For Cloudinary or external URL, return redirection or URL
    res.status(200).json({
      success: true,
      downloadCount: material.downloadCount,
      downloadUrl: material.fileUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Private (Owner or Admin)
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    // Check ownership or admin status
    if (
      req.user.role !== 'admin' &&
      material.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this material',
      });
    }

    // Clean up local file if stored locally
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

    // Delete associated reviews and favorites
    await Review.deleteMany({ materialId: material._id });
    await Favorite.deleteMany({ materialId: material._id });
    await material.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Study material and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular materials for dashboard & home
// @route   GET /api/materials/popular
// @access  Public
const getPopularMaterials = async (req, res, next) => {
  try {
    const popular = await Material.find({ status: 'approved' })
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name')
      .sort({ averageRating: -1, downloadCount: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: popular.length,
      data: popular,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent materials for dashboard & home
// @route   GET /api/materials/recent
// @access  Public
const getRecentMaterials = async (req, res, next) => {
  try {
    const recent = await Material.find({ status: 'approved' })
      .populate('subject', 'subjectName')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: recent.length,
      data: recent,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMaterial,
  getMaterials,
  searchMaterials,
  getMaterialById,
  getMyUploads,
  downloadMaterial,
  deleteMaterial,
  getPopularMaterials,
  getRecentMaterials,
};
