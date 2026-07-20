const Lecture = require('../models/Lecture');
const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Create a module lecture
// @route   POST /api/lectures
// @access  Private (Instructor/Admin)
exports.createLecture = async (req, res, next) => {
  try {
    const { moduleId, title, description, duration, order, videoUrl } = req.body;

    const moduleObj = await Module.findById(moduleId);
    if (!moduleObj) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    const course = await Course.findById(moduleObj.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to add lectures' });
    }

    // Set video URL
    let finalVideoUrl = videoUrl || '';
    if (req.file) {
      finalVideoUrl = `/uploads/${req.file.filename}`;
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ success: false, error: 'Please upload a video file or provide a video URL' });
    }

    const lecture = await Lecture.create({
      moduleId,
      title,
      description: description || '',
      videoUrl: finalVideoUrl,
      duration: duration || 10,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      data: lecture
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update module lecture
// @route   PUT /api/lectures/:id
// @access  Private (Instructor/Admin)
exports.updateLecture = async (req, res, next) => {
  try {
    let lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ success: false, error: 'Lecture not found' });
    }

    const moduleObj = await Module.findById(lecture.moduleId);
    const course = await Course.findById(moduleObj.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (req.file) {
      req.body.videoUrl = `/uploads/${req.file.filename}`;
    }

    lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: lecture
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete module lecture
// @route   DELETE /api/lectures/:id
// @access  Private (Instructor/Admin)
exports.deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ success: false, error: 'Lecture not found' });
    }

    const moduleObj = await Module.findById(lecture.moduleId);
    const course = await Course.findById(moduleObj.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await lecture.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
