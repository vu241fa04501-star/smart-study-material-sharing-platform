const Subject = require('../models/Subject');
const Material = require('../models/Material');

// @desc    Get all subjects (with optional count of approved materials)
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ subjectName: 1 });

    // Aggregate material count for each subject
    const subjectsWithCount = await Promise.all(
      subjects.map(async (subj) => {
        const materialCount = await Material.countDocuments({
          subject: subj._id,
          status: 'approved',
        });
        return {
          _id: subj._id,
          subjectName: subj.subjectName,
          description: subj.description,
          createdAt: subj.createdAt,
          materialCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: subjectsWithCount.length,
      data: subjectsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res, next) => {
  try {
    const { subjectName, description } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required',
      });
    }

    const existingSubject = await Subject.findOne({
      subjectName: { $regex: new RegExp(`^${subjectName.trim()}$`, 'i') },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name already exists',
      });
    }

    const subject = await Subject.create({
      subjectName: subjectName.trim(),
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check if any materials are using this subject
    const linkedMaterials = await Material.countDocuments({ subject: subject._id });
    if (linkedMaterials > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subject. It is currently linked to ${linkedMaterials} study materials.`,
      });
    }

    await subject.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  createSubject,
  deleteSubject,
};
