const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const fileUrl = require('../utils/fileUrl');

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-email')
      .populate('followers', 'fullname username profilePicture role')
      .populate('following', 'fullname username profilePicture role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ userId: user._id, isDeleted: false });

    res.json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      role: user.role || 'student',
      institution: user.institution || 'ODFEL Open University',
      faculty: user.faculty || '',
      department: user.department || '',
      courseOfStudy: user.courseOfStudy || '',
      academicLevel: user.academicLevel || '100 Level',
      matricNumber: user.matricNumber || '',
      followers: user.followers,
      following: user.following,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postCount,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullname, bio, username, role, institution, faculty, department, courseOfStudy, academicLevel, matricNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullname) user.fullname = fullname;
    if (bio !== undefined) user.bio = bio;
    if (role) user.role = role;
    if (institution !== undefined) user.institution = institution;
    if (faculty !== undefined) user.faculty = faculty;
    if (department !== undefined) user.department = department;
    if (courseOfStudy !== undefined) user.courseOfStudy = courseOfStudy;
    if (academicLevel !== undefined) user.academicLevel = academicLevel;
    if (matricNumber !== undefined) user.matricNumber = matricNumber;

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (req.files && req.files.profilePicture) {
      user.profilePicture = fileUrl(req, req.files.profilePicture[0].path.replace(/\\/g, '/'));
    }
    if (req.files && req.files.coverPhoto) {
      user.coverPhoto = fileUrl(req, req.files.coverPhoto[0].path.replace(/\\/g, '/'));
    }

    await user.save();

    res.json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      role: user.role,
      institution: user.institution,
      faculty: user.faculty,
      department: user.department,
      courseOfStudy: user.courseOfStudy,
      academicLevel: user.academicLevel,
      matricNumber: user.matricNumber,
      followers: user.followers,
      following: user.following,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow/Unfollow user
// @route   PUT /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(req.user._id);

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      await currentUser.save();
      await targetUser.save();
      res.json({ message: 'Unfollowed', following: false });
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
      await currentUser.save();
      await targetUser.save();

      // Create notification
      await Notification.create({
        receiverId: targetUser._id,
        senderId: req.user._id,
        type: 'follow',
        text: `${currentUser.fullname} started following you`,
      });

      res.json({ message: 'Followed', following: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [
        { fullname: regex },
        { username: regex },
        { email: regex },
        { courseOfStudy: regex },
        { department: regex },
      ],
    })
      .select('fullname username profilePicture bio role courseOfStudy department followers following')
      .limit(20);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users (people you may know)
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestions = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('fullname username profilePicture bio role courseOfStudy department followers')
      .limit(10);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get friends (following) list
// @route   GET /api/users/:id/friends
// @access  Private
const getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'fullname username profilePicture bio')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  toggleFollow,
  searchUsers,
  getSuggestions,
  getFriends,
};
