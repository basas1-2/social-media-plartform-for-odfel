  const Report = require('../models/Report');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Prevent duplicate reports
    const exists = await Report.findOne({
      reporterId: req.user._id,
      targetType,
      targetId,
    });

    if (exists) {
      return res.status(400).json({ message: 'You already reported this' });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason,
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports (admin)
// @route   GET /api/reports
// @access  Admin
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .populate('reporterId', 'fullname username profilePicture');

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (admin)
// @route   PUT /api/reports/:id
// @access  Admin
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status || report.status;
    await report.save();

    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, getReports, updateReportStatus };
