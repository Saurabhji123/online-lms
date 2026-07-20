const Certificate = require('../models/Certificate');

// @desc    Get certificates for a student
// @route   GET /api/certificates/me
// @access  Private
exports.getStudentCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ studentId: req.user.id }).populate('courseId', 'title duration');
    res.status(200).json({
      success: true,
      count: certs.length,
      data: certs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Verify a certificate by ID (Public verification)
// @route   GET /api/certificates/verify/:certId
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId })
      .populate('studentId', 'name email')
      .populate('courseId', 'title duration');

    if (!cert) {
      return res.status(404).json({ success: false, error: 'Certificate not found or invalid' });
    }

    res.status(200).json({
      success: true,
      data: {
        studentName: cert.studentId.name,
        courseTitle: cert.courseId.title,
        issuedAt: cert.issuedAt,
        certificateId: cert.certificateId
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
