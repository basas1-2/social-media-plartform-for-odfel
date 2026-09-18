const Resource = require('../models/Resource');
const fileUrl = require('../utils/fileUrl');

// @desc    Upload educational resource document
// @route   POST /api/resources
// @access  Private
const uploadResource = async (req, res, next) => {
  try {
    const { title, description, courseCode, subject, category } = req.body;

    if (!title || !courseCode) {
      return res.status(400).json({ message: 'Title and course code are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please attach a document file' });
    }

    const filePath = fileUrl(req, req.file.path.replace(/\\/g, '/'));

    const resource = await Resource.create({
      title,
      description: description || '',
      courseCode: courseCode.toUpperCase().trim(),
      subject: subject || '',
      category: category || 'Lecture Note',
      filePath,
      originalName: req.file.originalname,
      fileSize: req.file.size || 0,
      fileType: req.file.mimetype || 'document',
      uploaderId: req.user._id,
    });

    const populated = await Resource.findById(resource._id).populate('uploaderId', 'fullname username profilePicture role institution department');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get educational resources with filters
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res, next) => {
  try {
    const { category, courseCode, search } = req.query;
    const query = { isDeleted: false };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (courseCode) {
      query.courseCode = new RegExp(courseCode.trim(), 'i');
    }
    if (search) {
      const sRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: sRegex }, { description: sRegex }, { courseCode: sRegex }, { subject: sRegex }];
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .populate('uploaderId', 'fullname username profilePicture role institution department');

    res.json(resources);
  } catch (error) {
    next(error);
  }
};

// @desc    Increment resource download counter
// @route   PUT /api/resources/:id/download
// @access  Private
const incrementDownload = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.downloadsCount += 1;
    await resource.save();

    res.json({ downloadsCount: resource.downloadsCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote educational resource
// @route   PUT /api/resources/:id/upvote
// @access  Private
const toggleUpvoteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const hasUpvoted = resource.upvotes.includes(req.user._id);

    if (hasUpvoted) {
      resource.upvotes = resource.upvotes.filter((uid) => uid.toString() !== req.user._id.toString());
      await resource.save();
      res.json({ upvoted: false, count: resource.upvotes.length });
    } else {
      resource.upvotes.push(req.user._id);
      await resource.save();
      res.json({ upvoted: true, count: resource.upvotes.length });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResource,
  getResources,
  incrementDownload,
  toggleUpvoteResource,
};
