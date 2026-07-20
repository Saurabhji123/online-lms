const Resource = require('../models/Resource');
const Course = require('../models/Course');

// @desc    Get resources for a course
// @route   GET /api/resources/course/:courseId
// @access  Private
exports.getCourseResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ courseId: req.params.courseId });
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create/Upload a resource
// @route   POST /api/resources
// @access  Private (Instructor/Admin)
exports.createResource = async (req, res, next) => {
  try {
    const { courseId, lectureId, title, type, fileUrl } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    let finalFileUrl = fileUrl || '';
    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
    }

    const resource = await Resource.create({
      courseId,
      lectureId: lectureId || undefined,
      title,
      type,
      fileUrl: finalFileUrl
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
