const Module = require('../models/Module');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');

// @desc    Create a course module
// @route   POST /api/modules
// @access  Private (Instructor/Admin)
exports.createModule = async (req, res, next) => {
  try {
    const { courseId, title, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to add modules to this course' });
    }

    const moduleObj = await Module.create({
      courseId,
      title,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      data: moduleObj
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update course module
// @route   PUT /api/modules/:id
// @access  Private (Instructor/Admin)
exports.updateModule = async (req, res, next) => {
  try {
    let moduleObj = await Module.findById(req.params.id);
    if (!moduleObj) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    const course = await Course.findById(moduleObj.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    moduleObj = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: moduleObj
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete course module
// @route   DELETE /api/modules/:id
// @access  Private (Instructor/Admin)
exports.deleteModule = async (req, res, next) => {
  try {
    const moduleObj = await Module.findById(req.params.id);
    if (!moduleObj) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    const course = await Course.findById(moduleObj.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Delete lectures associated with this module
    await Lecture.deleteMany({ moduleId: moduleObj._id });
    await moduleObj.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
