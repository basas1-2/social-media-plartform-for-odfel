const Group = require('../models/Group');
const Post = require('../models/Post');
const fileUrl = require('../utils/fileUrl');

// @desc    Create study group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res, next) => {
  try {
    const { name, code, description, category, privacy } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    let avatar = '';
    let coverPhoto = '';

    if (req.files) {
      if (req.files.avatar) {
        avatar = fileUrl(req, req.files.avatar[0].path.replace(/\\/g, '/'));
      }
      if (req.files.coverPhoto) {
        coverPhoto = fileUrl(req, req.files.coverPhoto[0].path.replace(/\\/g, '/'));
      }
    }

    const group = await Group.create({
      name,
      code: code ? code.toUpperCase().trim() : '',
      description: description || '',
      category: category || 'Course Hub',
      privacy: privacy || 'public',
      avatar,
      coverPhoto,
      creatorId: req.user._id,
      admins: [req.user._id],
      members: [req.user._id],
    });

    const populated = await Group.findById(group._id).populate('creatorId', 'fullname username profilePicture role');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all study groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isDeleted: false };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      const sRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: sRegex }, { code: sRegex }, { description: sRegex }];
    }

    const groups = await Group.find(query)
      .sort({ createdAt: -1 })
      .populate('creatorId', 'fullname username profilePicture role')
      .populate('members', 'fullname username profilePicture');

    res.json(groups);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study group detail
// @route   GET /api/groups/:id
// @access  Private
const getGroupDetail = async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, isDeleted: false })
      .populate('creatorId', 'fullname username profilePicture role')
      .populate('admins', 'fullname username profilePicture role')
      .populate('members', 'fullname username profilePicture role institution courseOfStudy');

    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
};

// @desc    Join / Leave study group
// @route   PUT /api/groups/:id/join
// @access  Private
const toggleJoinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    const isMember = group.members.includes(req.user._id);

    if (isMember) {
      group.members = group.members.filter((id) => id.toString() !== req.user._id.toString());
      group.admins = group.admins.filter((id) => id.toString() !== req.user._id.toString());
      await group.save();
      res.json({ joined: false, memberCount: group.members.length });
    } else {
      group.members.push(req.user._id);
      await group.save();
      res.json({ joined: true, memberCount: group.members.length });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupDetail,
  toggleJoinGroup,
};
