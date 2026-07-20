const Course = require('../models/Course');
const Module = require('../models/Module');
const Lecture = require('../models/Lecture');

// @desc    Get all courses (with optional filters)
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    let query;
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filter match
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Finding resource
    query = Course.find(JSON.parse(queryStr)).populate({
      path: 'instructor',
      select: 'name email photo bio'
    });

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Executing query
    const courses = await query;

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single course detailed (with curriculum)
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'instructor',
      select: 'name email photo bio'
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Fetch modules
    const modules = await Module.find({ courseId: course._id }).sort('order');

    // Fetch lectures for all modules
    const modulesWithLectures = await Promise.all(
      modules.map(async (mod) => {
        const lectures = await Lecture.find({ moduleId: mod._id }).sort('order');
        return {
          ...mod._doc,
          lectures
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        course,
        curriculum: modulesWithLectures
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res, next) => {
  try {
    // Add instructor from req.user
    req.body.instructor = req.user.id;

    if (req.file) {
      req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Make sure user is instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this course' });
    }

    if (req.file) {
      req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this course' });
    }

    // Clean up related Modules, Lectures, and Course details
    const modules = await Module.find({ courseId: course._id });
    for (const mod of modules) {
      await Lecture.deleteMany({ moduleId: mod._id });
    }
    await Module.deleteMany({ courseId: course._id });
    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
