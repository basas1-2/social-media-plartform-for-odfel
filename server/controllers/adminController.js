const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalComments, totalReports, totalMessages, totalConversations] =
      await Promise.all([
        User.countDocuments(),
        Post.countDocuments({ isDeleted: false }),
        Comment.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
        Message.countDocuments(),
        Conversation.countDocuments(),
      ]);

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullname username profilePicture createdAt isAdmin isSuspended');

    // Recent posts
    const recentPosts = await Post.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'fullname username profilePicture');

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalReports,
      totalMessages,
      totalConversations,
      recentUsers,
      recentPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend/Activate user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Admin
const toggleSuspend = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot suspend an admin' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: user.isSuspended ? 'User suspended' : 'User activated',
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (hard delete)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete an admin' });
    }

    // Delete user's posts, comments, etc.
    await Post.updateMany({ userId: user._id }, { isDeleted: true });
    await Comment.updateMany({ userId: user._id }, { isDeleted: true });
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts for admin
// @route   GET /api/admin/posts
// @access  Admin
const getAdminPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'fullname username profilePicture');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post (admin hard delete option)
// @route   DELETE /api/admin/posts/:id
// @access  Admin
const deleteAdminPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await Comment.deleteMany({ postId: post._id });
    res.json({ message: 'Post permanently deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  toggleSuspend,
  deleteUser,
  getAdminPosts,
  deleteAdminPost,
};
